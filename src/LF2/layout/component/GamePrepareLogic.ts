import { new_team } from "../../base";
import Callbacks from "../../base/Callbacks";
import FSM, { IReadonlyFSM } from "../../base/FSM";
import Invoker from "../../base/Invoker";
import { NoEmitCallbacks } from "../../base/NoEmitCallbacks";
import LocalController from "../../controller/LocalController";
import { EntityGroup } from "../../defines";
import GameKey from "../../defines/GameKey";
import { Defines } from "../../defines/defines";
import Entity from "../../entity/Entity";
import { Factory } from "../../entity/Factory";
import { filter } from "../../utils/container_help";
import { map_no_void } from "../../utils/container_help/map_no_void";
import { random_get, random_in } from "../../utils/math/random";
import BackgroundNameText from "./BackgroundNameText";
import CharacterSelLogic from "./CharacterSelLogic";
import { Component } from "./Component";
import StageNameText from "./StageNameText";

export interface IGamePrepareLogicCallback {
  on_countdown?(v: number): void;
}
export enum GamePrepareState {
  PlayerCharacterSel = "PlayerCharacterSelecting",
  CountingDown = "CountingDown",
  ComNumberSel = "ComputerNumberSelecting",
  ComputerCharacterSel = "ComputerCharacterSelecting",
  GameSetting = "GameSetting",
}

export default class GamePrepareLogic extends Component {
  get game_mode(): string {
    return this.args[0];
  }
  protected _unmount_jobs = new Invoker();
  protected _callbacks = new Callbacks<IGamePrepareLogicCallback>();
  get state(): GamePrepareState {
    return this._fsm.state?.key!;
  }

  private _count_down: number = 5000;
  get callbacks(): NoEmitCallbacks<IGamePrepareLogicCallback> {
    return this._callbacks;
  }

  override on_resume(): void {
    super.on_resume();
    const btn_switch_bg = this.node.find_layout("btn_switch_bg");
    const btn_switch_stage = this.node.find_layout("btn_switch_stage");

    if (this.game_mode === "vs_mode") {
      btn_switch_bg?.set_visible(true).set_disabled(false);
      btn_switch_stage?.set_visible(false).set_disabled(true);
    } else if (this.game_mode === "stage_mode") {
      btn_switch_stage?.set_visible(true).set_disabled(false);
      btn_switch_bg?.set_visible(false).set_disabled(true);
    }

    this._fsm.use(GamePrepareState.PlayerCharacterSel);
    this._unmount_jobs.add(
      ...map_no_void(this.lf2.players.values(), (v) =>
        v.callbacks.add({
          on_joined_changed: () => this.on_someone_changed(),
          on_team_decided: () => this.on_someone_changed(),
        }),
      ),
      this.lf2.callbacks.add({
        on_broadcast: (m) => {
          if (m === Defines.BuiltIn_Broadcast.ResetGPL)
            this._fsm.use(GamePrepareState.PlayerCharacterSel);
          if (m === Defines.BuiltIn_Broadcast.UpdateRandom)
            this.update_random();
          if (m === Defines.BuiltIn_Broadcast.StartGame) this.start_game();
        },
      }),
    );
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  override on_player_key_down(_player_id: string, key: GameKey) {
    switch (this.state) {
      case GamePrepareState.PlayerCharacterSel:
        if ("j" === key && !this.used_player_slots.length) {
          this.lf2.pop_layout();
        }
        break;
      case GamePrepareState.CountingDown:
        if ("j" === key) {
          this._count_down = Math.max(0, this._count_down - 500);
          this._callbacks.emit("on_countdown")(
            Math.ceil(this._count_down / 1000),
          );
        }
        break;
      case GamePrepareState.ComNumberSel:
      case GamePrepareState.GameSetting:
        if ("d" === key) this._fsm.use(GamePrepareState.PlayerCharacterSel);
        break;
      case GamePrepareState.ComputerCharacterSel:
        if ("j" === key && !this.joined_com_infos.length)
          this._fsm.use(GamePrepareState.ComNumberSel);
        break;
    }
  }

  protected on_someone_changed() {
    let joined_num = 0;
    let ready_num = 0;
    for (const [, p] of this.lf2.players) {
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

  override update(dt: number): void {
    this._fsm.update(dt);
  }
  get fsm(): IReadonlyFSM<GamePrepareState> {
    return this._fsm;
  }
  private _fsm = new FSM<GamePrepareState>()
    .add(
      {
        key: GamePrepareState.PlayerCharacterSel,
        enter: () => {
          this._com_num = 0;
          for (const [, player] of this.lf2.players) {
            if (player.is_com) player.set_joined(false, true);
            player.set_team_decided(false, true);
            player.set_character_decided(false, true);
            player.set_is_com(false, true);
          }
        },
      },
      {
        key: GamePrepareState.CountingDown,
        enter: () => {
          this._count_down = 5000;
          this._callbacks.emit("on_countdown")(5);
        },
        update: (dt) => {
          const prev_second = Math.ceil(this._count_down / 1000);
          this._count_down -= dt;
          const curr_second = Math.ceil(this._count_down / 1000);
          if (curr_second !== prev_second)
            this._callbacks.emit("on_countdown")(curr_second);
          if (this._count_down <= 0) return GamePrepareState.ComNumberSel;
        },
      },
      {
        key: GamePrepareState.ComNumberSel,
        enter: () => {
          for (const { player: p } of this.com_slots) {
            p
              ?.set_is_com(false, true)
              .set_joined(false, true)
              .set_team_decided(false, true)
              .set_random_character("", true);
          }
          const { player_slots } = this;
          const joined_num = filter(player_slots, (v) => v.joined).length;
          const not_joined_num = filter(player_slots, (v) => !v.joined).length;

          if (this.game_mode !== "stage_mode")
            this._min_com_num = joined_num <= 1 ? 1 : 0;

          this._max_com_num = not_joined_num;
          this.node.find_layout("how_many_computer")?.set_visible(true);
        },
        leave: () =>
          this.node.find_layout("how_many_computer")?.set_visible(false),
      },
      {
        key: GamePrepareState.ComputerCharacterSel,
      },
      {
        key: GamePrepareState.GameSetting,
        enter: () => {
          this.update_random();
          this.node.find_layout("menu")?.set_visible(true);
        },
        leave: () => {
          for (const { player: p } of this.player_slots)
            p?.set_random_character("", true);
          this.node.find_layout("menu")?.set_visible(false);
        },
      },
    )
    .use(GamePrepareState.PlayerCharacterSel);

  /** 至少可选COM数量 */
  private _min_com_num = 0;
  /** 至多可选COM数量 */
  private _max_com_num = 7;
  /** 指定选COM数量 */
  private _com_num = 0;

  private update_random() {
    for (const { player: p } of this.player_slots) {
      if (!p?.joined || !p.is_random) continue;
      const { characters } = this.lf2.datas.find_group(
        EntityGroup.Regular,
      );
      p.set_random_character(random_get(characters)?.id ?? "", true);
    }
  }

  /** 至少可选COM数量 */
  get min_com_num(): number {
    return this._min_com_num;
  }
  /** 至多可选COM数量 */
  get max_com_num(): number {
    return this._max_com_num;
  }
  /** 指定选COM数量 */
  get com_num(): number {
    return this._com_num;
  }

  get player_slots(): CharacterSelLogic[] {
    // 全部“玩家槽”
    return this.node.root.search_components(CharacterSelLogic);
  }
  get joined_com_infos(): CharacterSelLogic[] {
    // 已加入的“电脑槽”
    return filter(
      this.node.root.search_components(CharacterSelLogic),
      (v) => v.player?.is_com && v.player.joined,
    );
  }
  get com_slots(): CharacterSelLogic[] {
    // 电脑槽”
    return filter(
      this.node.root.search_components(CharacterSelLogic),
      (v) => v.player?.is_com,
    );
  }
  get used_player_slots(): CharacterSelLogic[] {
    // 未使用玩家槽
    return filter(
      this.node.root.search_components(CharacterSelLogic),
      (v) => v.player?.joined,
    );
  }
  get empty_player_slots(): CharacterSelLogic[] {
    // 未使用玩家槽
    return filter(
      this.node.root.search_components(CharacterSelLogic),
      (v) => !v.player?.joined,
    );
  }

  handling_com: CharacterSelLogic | undefined;

  set_com_num(num: number) {
    this._com_num = num;
    if (num > 0) {
      const { empty_player_slots } = this;
      this.handling_com = empty_player_slots[0];
      while (num > 0 && empty_player_slots.length) {
        empty_player_slots.shift()?.player?.set_is_com(true, true);
        num -= 1;
      }
      this._fsm.use(GamePrepareState.ComputerCharacterSel);
    } else {
      this._fsm.use(GamePrepareState.GameSetting);
    }
  }

  start_game() {
    const { far, near, left, right } = this.lf2.world.bg;

    for (const { player } of this.player_slots) {
      if (!player?.joined) continue;
      const character_data = this.lf2.datas.find_character(player.character);
      if (!character_data) continue;
      const character = new Entity(this.world, character_data);
      character.name = player.is_com ? "com" : player.name;
      character.team = player.team || new_team();
      character.facing = Math.random() < 0.5 ? 1 : -1;

      if (player.is_com) {
        character.ctrl = Factory.inst.get_ctrl(
          character_data.id,
          player.id,
          character
        );
      } else {
        character.ctrl = new LocalController(
          player.id,
          character,
          player.keys,
        );
      }
      character.position.z = random_in(far, near);
      character.position.x = random_in(left, right);
      character.blinking = this.world.begin_blink_time;
      character.attach();
    }

    const stage_name_text = this.node.root.search_component(
      StageNameText,
      (v) => v.node.global_visible && !v.node.global_disabled,
    );
    const background_name_text = this.node.root.search_component(
      BackgroundNameText,
      (v) => v.node.global_visible && !v.node.global_disabled,
    );
    if (stage_name_text) this.lf2.change_stage(stage_name_text.stage);
    if (background_name_text)
      this.lf2.change_bg(background_name_text.background);
    if (stage_name_text) this.lf2.push_layout("stage_mode_page");
    else this.lf2.push_layout("vs_mode_page");
  }
}
