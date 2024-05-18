import { filter, find, find_last } from "../../utils/container_help";
import { map_no_void } from "../../utils/container_help/map_no_void";
import { PlayerInfo } from "../../PlayerInfo";
import Callbacks from "../../base/Callbacks";
import Invoker from "../../base/Invoker";
import NoEmitCallbacks from "../../base/NoEmitCallbacks";
import { TKeyName } from "../../controller/BaseController";
import { FSM, IReadonlyFSM } from "../StateMachine";
import CharacterSelLogic from "./CharacterSelLogic";
import { LayoutComponent } from "./LayoutComponent";
import { random_get } from "../../utils/math/random";

export interface IGamePrepareLogicCallback {
  on_countdown?(v: number): void;
}
export enum GamePrepareState {
  PlayerCharacterSel = 'PlayerCharacterSelecting',
  CountingDown = 'CountingDown',
  ComNumberSel = 'ComputerNumberSelecting',
  ComputerCharacterSel = 'ComputerCharacterSelecting',
  GameSetting = 'GameSetting',
}

export default class GamePrepareLogic extends LayoutComponent {
  protected _unmount_jobs = new Invoker();
  protected _callbacks = new Callbacks<IGamePrepareLogicCallback>();
  get state(): GamePrepareState { return this._fsm.state?.key!; }

  private _count_down: number = 5000;
  get callbacks(): NoEmitCallbacks<IGamePrepareLogicCallback> { return this._callbacks }

  override on_mount(): void {
    super.on_mount();
    this._fsm.use(GamePrepareState.PlayerCharacterSel)
    this._unmount_jobs.add(
      ...map_no_void(this.lf2.player_infos.values(), v => v.callbacks.add({
        on_joined_changed: () => this.on_someone_changed(),
        on_team_decided: () => this.on_someone_changed(),
      }))
    )
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke();
    this._unmount_jobs.clear();
  }

  override on_player_key_down(_player_id: string, key: TKeyName) {
    switch (this.state) {
      case GamePrepareState.PlayerCharacterSel:
        break;
      case GamePrepareState.CountingDown:
        if ('j' === key) {
          this._count_down = Math.max(0, this._count_down - 500);
          this._callbacks.emit('on_countdown')(Math.ceil(this._count_down / 1000));
        }
        break;
      case GamePrepareState.ComNumberSel:
        if ('d' === key) this._fsm.use(GamePrepareState.PlayerCharacterSel);
        break;
      case GamePrepareState.GameSetting:
        if ('j' === key) this._fsm.use(GamePrepareState.PlayerCharacterSel);
        break;
      case GamePrepareState.ComputerCharacterSel:
        if ('j' === key && !this.joined_com_infos.length)
          this._fsm.use(GamePrepareState.ComNumberSel)
        break;
    }
  }

  protected on_someone_changed() {
    let joined_num = 0;
    let ready_num = 0;
    for (const [, p] of this.lf2.player_infos) {
      if (p.joined || p.is_com) joined_num += 1; // 已加入人数
      if (p.team_decided) ready_num += 1; // 已准备人数
    }
    if (ready_num && ready_num === joined_num) {
      if (this.state === GamePrepareState.ComputerCharacterSel) {
        this._fsm.use(GamePrepareState.GameSetting);
      } else if (this.state === GamePrepareState.PlayerCharacterSel) {
        this._fsm.use(GamePrepareState.CountingDown);
      }
    } else if (ready_num < joined_num) {
      if (this.state === GamePrepareState.CountingDown) {
        this._fsm.use(GamePrepareState.PlayerCharacterSel);
      }
    }
  }

  override on_render(dt: number): void {
    this._fsm.update(dt);
  }
  get fsm(): IReadonlyFSM<GamePrepareState> {
    return this._fsm;
  }
  private _fsm = new FSM<GamePrepareState>()
    .add({
      key: GamePrepareState.PlayerCharacterSel,
      enter: () => {
        this._com_num = 0;
        for (const [, player] of this.lf2.player_infos) {
          if (player.is_com) player.joined = false;
          player.team_decided = false;
          player.character_decided = false;
          player.is_com = false;
        }
      }
    }, {
      key: GamePrepareState.CountingDown,
      enter: () => {
        this._count_down = 5000;
        this._callbacks.emit('on_countdown')(5);
      },
      update: (dt) => {
        const prev_second = Math.ceil(this._count_down / 1000);
        this._count_down -= dt
        const curr_second = Math.ceil(this._count_down / 1000);
        if (curr_second !== prev_second)
          this._callbacks.emit('on_countdown')(curr_second);
        if (this._count_down <= 0)
          return GamePrepareState.ComNumberSel;
      }
    }, {
      key: GamePrepareState.ComNumberSel,
      enter: () => {
        for (const { player: p } of this.com_slots) {
          p?.set_is_com(false)
            .set_joined(false)
            .set_team_decided(false)
            .set_random_character('')
        }
        const { player_slots } = this
        const joined_num = filter(player_slots, v => v.joined).length;
        const not_joined_num = filter(player_slots, v => !v.joined).length;
        this._min_com_num = joined_num <= 1 ? 1 : 0; // TODO: 闯关只需1人
        this._max_com_num = not_joined_num;
        this.layout.find_layout('how_many_computer')?.set_visible(true)
      },
      leave: () => this.layout.find_layout('how_many_computer')?.set_visible(false)
    }, {
      key: GamePrepareState.ComputerCharacterSel,
    }, {
      key: GamePrepareState.GameSetting,
      enter: () => {
        for (const { player: p } of this.player_slots) {
          if (!p?.joined || !p.is_random) continue;
          const characters = this.lf2.datas.characters.filter(v => !v.base.hidden);
          p.set_random_character(random_get(characters)?.id ?? '');
        }
        this.layout.find_layout('menu')?.set_visible(true)
      },
      leave: () => {
        for (const { player: p } of this.player_slots)
          p?.set_random_character('');
        this.layout.find_layout('menu')?.set_visible(false)
      }
    }).use(GamePrepareState.PlayerCharacterSel);

  /** 至少可选COM数量 */
  private _min_com_num = 0;
  /** 至多可选COM数量 */
  private _max_com_num = 7;
  /** 指定选COM数量 */
  private _com_num = 0;

  /** 至少可选COM数量 */
  get min_com_num(): number { return this._min_com_num };
  /** 至多可选COM数量 */
  get max_com_num(): number { return this._max_com_num };
  /** 指定选COM数量 */
  get com_num(): number { return this._com_num };

  get player_slots(): CharacterSelLogic[] { // 全部“玩家槽”
    return this.layout.root.search_components(CharacterSelLogic)
  }
  get joined_com_infos(): CharacterSelLogic[] { // 已加入的“电脑槽”
    return filter(
      this.layout.root.search_components(CharacterSelLogic),
      v => v.player?.is_com && v.player.joined
    )
  }
  get com_slots(): CharacterSelLogic[] { // 电脑槽”
    return filter(
      this.layout.root.search_components(CharacterSelLogic),
      v => v.player?.is_com
    )
  }
  get empty_player_slots(): CharacterSelLogic[] { // 未使用玩家槽
    return filter(
      this.layout.root.search_components(CharacterSelLogic),
      v => !v.player?.joined
    )
  }

  handling_com: CharacterSelLogic | undefined

  set_com_num(num: number) {
    this._com_num = num;
    if (num > 0) {
      const { empty_player_slots } = this
      this.handling_com = empty_player_slots[0];
      while (num > 0 && empty_player_slots.length) {
        empty_player_slots.shift()?.player?.set_is_com(true);
        num -= 1;
      }
      this._fsm.use(GamePrepareState.ComputerCharacterSel);
    } else {
      this._fsm.use(GamePrepareState.GameSetting);
    }
  }
}