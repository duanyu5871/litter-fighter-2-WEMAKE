import Callbacks from "../../base/Callbacks";
import FSM, { IReadonlyFSM } from "../../base/FSM";
import Invoker from "../../base/Invoker";
import NoEmitCallbacks from "../../base/NoEmitCallbacks";
import { TKeyName } from "../../controller/BaseController";
import { BotEnemyChaser } from "../../controller/BotEnemyChaser";
import LocalHuman from "../../controller/LocalHuman";
import { Defines } from "../../defines/defines";
import Character from "../../entity/Character";
import { filter } from "../../utils/container_help";
import { map_no_void } from "../../utils/container_help/map_no_void";
import { random_get } from "../../utils/math/random";
import BackgroundNameText from "./BackgroundNameText";
import CharacterSelLogic from "./CharacterSelLogic";
import { LayoutComponent } from "./LayoutComponent";
import StageNameText from "./StageNameText";

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
  get game_mode(): string { return this.args[0] }
  protected _unmount_jobs = new Invoker();
  protected _callbacks = new Callbacks<IGamePrepareLogicCallback>();
  get state(): GamePrepareState { return this._fsm.state?.key!; }

  private _count_down: number = 5000;
  get callbacks(): NoEmitCallbacks<IGamePrepareLogicCallback> { return this._callbacks }

  override on_mount(): void {
    super.on_mount();


    const btn_switch_bg = this.layout.find_layout('btn_switch_bg')
    const btn_switch_stage = this.layout.find_layout('btn_switch_stage')

    if (this.game_mode === 'vs_mode') {
      btn_switch_bg?.set_visible(true).set_disabled(false)
      btn_switch_stage?.set_visible(false).set_disabled(true)
    } else if (this.game_mode === 'stage_mode') {
      btn_switch_stage?.set_visible(true).set_disabled(false)
      btn_switch_bg?.set_visible(false).set_disabled(true)
    }

    this._fsm.use(GamePrepareState.PlayerCharacterSel)
    this._unmount_jobs.add(
      ...map_no_void(this.lf2.player_infos.values(), v => v.callbacks.add({
        on_joined_changed: () => this.on_someone_changed(),
        on_team_decided: () => this.on_someone_changed(),
      })),
      this.lf2.callbacks.add({
        on_broadcast: m => {
          if (m === Defines.BuiltIn.Broadcast.ResetGPL)
            this._fsm.use(GamePrepareState.PlayerCharacterSel)
          if (m === Defines.BuiltIn.Broadcast.UpdateRandom)
            this.update_random();
          if (m === Defines.BuiltIn.Broadcast.StartGame)
            this.start_game();
        },
      })
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
        if ('j' === key && !this.used_player_slots.length) {
          this.lf2.pop_layout();
        }
        break;
      case GamePrepareState.CountingDown:
        if ('j' === key) {
          this._count_down = Math.max(0, this._count_down - 500);
          this._callbacks.emit('on_countdown')(Math.ceil(this._count_down / 1000));
        }
        break;
      case GamePrepareState.ComNumberSel:
      case GamePrepareState.GameSetting:
        if ('d' === key) this._fsm.use(GamePrepareState.PlayerCharacterSel);
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

        if (this.game_mode !== 'stage_mode')
          this._min_com_num = joined_num <= 1 ? 1 : 0;

        this._max_com_num = not_joined_num;
        this.layout.find_layout('how_many_computer')?.set_visible(true)
      },
      leave: () => this.layout.find_layout('how_many_computer')?.set_visible(false)
    }, {
      key: GamePrepareState.ComputerCharacterSel,
    }, {
      key: GamePrepareState.GameSetting,
      enter: () => {
        this.update_random();
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

  private update_random() {
    for (const { player: p } of this.player_slots) {
      if (!p?.joined || !p.is_random) continue;
      const characters = this.lf2.datas.characters.filter(v => !v.base.hidden);
      p.set_random_character(random_get(characters)?.id ?? '');
    }
  }

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
  get used_player_slots(): CharacterSelLogic[] { // 未使用玩家槽
    return filter(
      this.layout.root.search_components(CharacterSelLogic),
      v => v.player?.joined
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

  start_game() {
    for (const { player } of this.player_slots) {
      if (!player?.joined) continue;
      const character_data = this.lf2.datas.find_character(player.character)
      if (!character_data) continue;
      const character = new Character(this.world, character_data)
      character.name = player.is_com ? 'com' : player.name;
      character.team = player.team
      character.facing = Math.random() < 0.5 ? 1 : -1
      character.controller = player.is_com ?
        new BotEnemyChaser(player.id, character) :
        new LocalHuman(player.id, character, player.keys)
      character.attach();
    }

    const stage_name_text = this.layout.root.search_component(StageNameText, v => v.layout.global_visible && !v.layout.global_disabled)
    const background_name_text = this.layout.root.search_component(BackgroundNameText, v => v.layout.global_visible && !v.layout.global_disabled)
    if (stage_name_text) this.lf2.change_stage(stage_name_text.stage);
    if (background_name_text) this.lf2.change_bg(background_name_text.background);

    if (stage_name_text)
      this.lf2.push_layout('stage_mode_page');
    else
      this.lf2.push_layout('vs_mode_page');
  }
}