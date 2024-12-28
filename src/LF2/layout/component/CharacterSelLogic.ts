import type { PlayerInfo } from "../../PlayerInfo";
import Invoker from "../../base/Invoker";
import GameKey from "../../defines/GameKey";
import { Defines } from "../../defines/defines";
import GamePrepareLogic, { GamePrepareState } from "./GamePrepareLogic";
import { LayoutComponent } from "./LayoutComponent";

/**
 * 角色选择逻辑
 *
 * @export
 * @class CharacterSelLogic
 * @extends {LayoutComponent}
 */
export default class CharacterSelLogic extends LayoutComponent {
  get player_id() {
    return this.args[0] || "";
  }

  get player(): PlayerInfo | undefined {
    return this.lf2.player_infos.get(this.player_id);
  }

  get character(): string {
    return this.player?.character || "";
  }
  set character(v: string) {
    if (this.player) this.player.character = v;
  }

  get character_decided() {
    return !!this.player?.character_decided;
  }
  set character_decided(v: boolean) {
    if (this.player) this.player.character_decided = v;
  }

  get team_decided(): boolean {
    return !!this.player?.team_decided;
  }
  set team_decided(v: boolean) {
    if (this.player) this.player.team_decided = v;
  }

  get team(): string {
    return this.player?.team ?? "";
  }
  set team(v: string) {
    if (this.player) this.player.team = v;
  }

  get joined(): boolean {
    return !!this.player?.joined;
  }
  set joined(v: boolean) {
    if (this.player) this.player.joined = v;
  }

  protected _unmount_jobs = new Invoker();

  get gpl() {
    return this.layout.root.find_component(GamePrepareLogic);
  }

  override on_resume(): void {
    super.on_resume();
    this._unmount_jobs.add(
      this.lf2.callbacks.add({
        on_cheat_changed: (cheat_name, enabled) => {
          // 当前选择的角色被隐藏时，让玩家选随机
          if (cheat_name === Defines.Cheats.LF2_NET && !enabled)
            this.handle_hidden_character();
        },
      }),
    );
    if (!this.lf2.is_cheat_enabled(Defines.Cheats.LF2_NET))
      this.handle_hidden_character();
  }

  override on_pause(): void {
    super.on_pause();
    this.joined = false;
    this.character_decided = false;
    this.team_decided = false;
    this._unmount_jobs.invoke_and_clear();
  }

  get characters() {
    return this.lf2.is_cheat_enabled(Defines.Cheats.LF2_NET)
      ? this.lf2.datas.characters
      : this.lf2.datas.get_characters_not_in_group(Defines.EntityGroup.Hidden);
  }

  override on_player_key_down(player_id: string, key: GameKey): void {
    const { gpl } = this;
    if (!gpl) {
      return;
    } else if (gpl.state === GamePrepareState.PlayerCharacterSel) {
      if (player_id !== this.player_id) {
        return;
      }
    } else if (gpl.state === GamePrepareState.ComputerCharacterSel) {
      if (!this.player?.is_com) {
        return;
      }
      if (this !== gpl.handling_com) {
        return;
      }
    } else {
      return;
    }

    if (key === "j") this.lf2.sounds.play_preset("cancel");
    if (key === "a") this.lf2.sounds.play_preset("join");

    if (this.team_decided) {
      if (key === "j") {
        this.team_decided = false;
      }
    } else if (this.character_decided) {
      if ("a" === key) {
        this.team_decided = true;
      } else if ("j" === key) {
        this.character_decided = false;
      } else if ("L" === key) {
        const idx = Defines.Teams.findIndex((v) => v === this.team);
        const next_idx =
          (idx + Defines.Teams.length - 1) % Defines.Teams.length;
        this.team = Defines.Teams[next_idx];
      } else if ("R" === key) {
        // 下一个队伍
        const idx = Defines.Teams.findIndex((v) => v === this.team);
        const next_idx = (idx + 1) % Defines.Teams.length;
        this.team = Defines.Teams[next_idx];
      }
    } else if (this.joined) {
      if ("a" === key) {
        // 按攻击确认角色,
        this.character_decided = true;
        // 闯关模式下，直接确定为第一队
        if (this.gpl?.game_mode === "stage_mode") {
          this.team = Defines.TeamEnum.Team_1;
          this.team_decided = true;
        }
      } else if ("j" === key) {
        // 按跳跃取消加入
        this.joined = false;
      } else if ("D" === key || "U" === key) {
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
    } else if (key === "a") {
      this.joined = true;
    }

    if (gpl.state === GamePrepareState.ComputerCharacterSel) {
      const { com_slots } = gpl;
      const my_index = com_slots.indexOf(this);
      if (this.team_decided) gpl.handling_com = com_slots[my_index + 1];
      else if (!this.joined && my_index > 0)
        gpl.handling_com = com_slots[my_index - 1];
    }
  }

  /**
   * 当前选择的角色被隐藏时，让玩家选随机
   *
   * @protected
   */
  protected handle_hidden_character() {
    const { characters } = this;
    const idx = characters.findIndex((v) => v.id === this.character);
    this.player?.set_character(characters[idx]?.id ?? "");
  }
}
