import type { PlayerInfo } from "../../PlayerInfo";
import FSM, { IState } from "../../base/FSM";
import Invoker from "../../base/Invoker";
import { CheatType, EntityGroup } from "../../defines";
import GameKey from "../../defines/GameKey";
import { Defines } from "../../defines/defines";
import GamePrepareLogic, { GamePrepareState } from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";
export enum SlotSelStatus {
  Empty = 'Empty',
  Character = 'Player_Character',
  Team = 'Player_Team',
  Ready = 'Player_Done',
}

interface IStateUnit extends IState<SlotSelStatus> {
  on_player_key_down?(player_id: string, key: GameKey): void;
}

/**
 * 角色选择逻辑
 *
 * @export
 * @class CharacterSelLogic
 * @extends {UIComponent}
 */
export default class SlotSelLogic extends UIComponent {
  fsm = new FSM<SlotSelStatus, IStateUnit>().add({
    key: SlotSelStatus.Empty,
    enter: () => {
      this.joined = false;
      this.team_decided = false;
      this.character_decided = false;
      this.is_com = false;
      this.player.set_random_character('', true)
    },
    on_player_key_down: (player_id, key) => {
      if (this.player_id != player_id && this.gpl.handling_com !== this) return;
      if (key !== 'a') return;
      this.fsm.use(SlotSelStatus.Character);
      this.lf2.sounds.play_preset("join");
    },
  }, {
    key: SlotSelStatus.Character,
    enter: () => {
      this.joined = true
      this.character_decided = false
      this.team_decided = false;
    },
    on_player_key_down: (player_id, key) => {
      if (this.player_id != player_id && this.gpl.handling_com !== this) return;
      if (key === "j") this.lf2.sounds.play_preset("cancel");
      if (key === "a") this.lf2.sounds.play_preset("join");
      if (key === 'a') {
        // 按攻击确认角色,
        this.character_decided = true;
        // 闯关模式下，直接确定为第一队
        if (this.gpl.game_mode === "stage_mode") {
          this.team = Defines.TeamEnum.Team_1;
          this.fsm.use(SlotSelStatus.Ready)
        } else {
          this.fsm.use(SlotSelStatus.Team)
        }
      } else if (key === 'j') {
        // 按跳跃取消加入
        this.fsm.use(SlotSelStatus.Empty);
        if (this.gpl.handling_com === this) {
          this.gpl.handling_com === this.gpl.coms[this.gpl.coms.indexOf(this) - 1];
        }
      } else {
        this.swtich_fighter(key);
      }
    },
  }, {
    key: SlotSelStatus.Team,
    enter: () => {
      this.joined = true
      this.character_decided = true
      this.team_decided = false;
    }, on_player_key_down: (player_id, key) => {
      if (this.player_id != player_id && this.gpl.handling_com !== this) return;
      if (key === "j") this.lf2.sounds.play_preset("cancel");
      if (key === "a") this.lf2.sounds.play_preset("join");
      if ("a" === key) {
        this.fsm.use(SlotSelStatus.Ready);

      } else if ("j" === key) {
        this.fsm.use(SlotSelStatus.Character);
      } else {
        this.switch_team(key);
      }
    },
  }, {
    key: SlotSelStatus.Ready,
    enter: () => {
      this.joined = true
      this.character_decided = true
      this.team_decided = true;
      if (this.gpl.handling_com === this) this.gpl.handle_next_com()
    }, on_player_key_down: (player_id, key) => {
      if (this.player_id != player_id && this.gpl.handling_com !== this) return;
      if (key === "j") this.lf2.sounds.play_preset("cancel");
      if (key === "j") {
        if (this.gpl.game_mode === "stage_mode") {
          this.fsm.use(SlotSelStatus.Character)
        } else {
          this.fsm.use(SlotSelStatus.Team)
        }
      }
    },
  });

  get player_id() {
    return this.args[0] || "";
  }

  get player(): PlayerInfo { return this.lf2.players.get(this.player_id)! }

  get character(): string {
    return this.player?.character || "";
  }
  set character(v: string) {
    this.player!.set_character(v, true);
  }

  get character_decided() {
    return !!this.player?.character_decided;
  }
  set character_decided(v: boolean) {
    this.player!.set_character_decided(v, true);
  }

  get team_decided(): boolean {
    return !!this.player?.team_decided;
  }
  set team_decided(v: boolean) {
    this.player!.set_team_decided(v, true);
  }

  get team(): string {
    return this.player?.team ?? "";
  }
  set team(v: string) {
    this.player!.set_team(v, true);
  }

  get joined(): boolean {
    return !!this.player?.joined;
  }
  set joined(v: boolean) {
    this.player!.set_joined(v, true);
  }
  get is_com(): boolean {
    return !!this.player?.is_com;
  }
  set is_com(v: boolean) {
    this.player!.set_is_com(v, true);
  }
  protected _unmount_jobs = new Invoker();

  get gpl() {
    return this.node.root.find_component(GamePrepareLogic)!;
  }

  private swtich_fighter(key: GameKey) {
    if ("D" === key || "U" === key) {
      // 按上或下,回到随机
      this.character = "";
    } else if ("L" === key) {
      // 上一个角色
      const { characters } = this;
      const idx = characters.findIndex((v) => v.id === this.character);
      const next = idx <= -1 ? characters.length - 1 : idx - 1;
      this.character = characters[next]?.id ?? "";
    } else if ("R" === key) {
      // 下一个角色
      const { characters } = this;
      const idx = characters.findIndex((v) => v.id === this.character);
      const next = idx >= characters.length - 1 ? -1 : idx + 1;
      this.character = characters[next]?.id ?? "";
    }
  }

  private switch_team(key: GameKey) {
    if ("L" === key) {
      // 上一个队伍
      const idx = Defines.Teams.findIndex((v) => v === this.team);
      const next_idx = (idx + Defines.Teams.length - 1) % Defines.Teams.length;
      this.team = Defines.Teams[next_idx]!;
    } else if ("R" === key) {
      // 下一个队伍
      const idx = Defines.Teams.findIndex((v) => v === this.team);
      const next_idx = (idx + 1) % Defines.Teams.length;
      this.team = Defines.Teams[next_idx]!;
    }
  }

  override on_resume(): void {
    super.on_resume();
    this._unmount_jobs.add(
      this.lf2.callbacks.add({
        on_cheat_changed: (cheat_name, enabled) => {
          // 当前选择的角色被隐藏时，让玩家选随机
          if (cheat_name === CheatType.LF2_NET && !enabled)
            this.handle_hidden_character();
        },
      }),
    );
    if (!this.lf2.is_cheat_enabled(CheatType.LF2_NET))
      this.handle_hidden_character();

    this.fsm.use(SlotSelStatus.Empty)
  }

  override on_pause(): void {
    super.on_pause();
    this.joined = false;
    this.character_decided = false;
    this.team_decided = false;
    this._unmount_jobs.invoke_and_clear();
  }

  get characters() {
    return this.lf2.is_cheat_enabled(CheatType.LF2_NET)
      ? this.lf2.datas.characters
      : this.lf2.datas.get_characters_not_in_group(EntityGroup.Hidden);
  }

  override on_player_key_down(player_id: string, key: GameKey): void {
    if (
      this.gpl.state === GamePrepareState.Player && this.player_id == player_id ||
      this.gpl.state === GamePrepareState.Computer && this.gpl.handling_com === this
    ) this.fsm.state?.on_player_key_down?.(player_id, key)
  }
  override update(dt: number): void {
    this.fsm.update(dt)
  }
  /**
   * 当前选择的角色被隐藏时，让玩家选随机
   *
   * @protected
   */
  protected handle_hidden_character() {
    const { characters } = this;
    const idx = characters.findIndex((v) => v.id === this.character);
    this.player?.set_character(characters[idx]?.id ?? "", true);
  }
}
