import { ILf2Callback } from '../../LF2/ILf2Callback';
import type { PlayerInfo } from "../../LF2/PlayerInfo";
import { TKeyName } from '../../LF2/controller/BaseController';
import { SineAnimation } from '../../SineAnimation';
import { Defines } from '../../common/lf2_type/defines';
import GamePrepareLogic, { IGamePrepareLogicCallback } from './GamePrepareLogic';
import { LayoutComponent } from "./LayoutComponent";

/**
 * 玩家角色选择逻辑
 * 
 * @export
 * @class PlayerCharacterSelLogic
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterSelLogic extends LayoutComponent {
  protected _player_id: string = '';
  protected _jid: number = 0;
  protected _hints_opacity: SineAnimation = new SineAnimation(0.75, 1, 1 / 50);
  private _game_prepare_logic_listener: Partial<IGamePrepareLogicCallback> = {
    on_all_ready: () => this.on_all_player_ready(),
    on_not_ready: () => this.on_not_all_player_ready(),
    on_countdown: (v) => this.on_countdown(v)
  };

  get player(): PlayerInfo | undefined { return this.lf2.player_infos.get(this._player_id) };

  get character(): string { return this.player?.character || ''; }
  set character(v: string) { if (this.player) this.player.character = v; }

  get character_decided() { return !!this.player?.character_decided; }
  set character_decided(v: boolean) { if (this.player) this.player.character_decided = v; }

  get team_decided(): boolean { return !!this.player?.team_decided; }
  set team_decided(v: boolean) { if (this.player) this.player.team_decided = v; }

  get team(): string { return this.player?.team ?? ''; }
  set team(v: string) { if (this.player) this.player.team = v; }

  get joined(): boolean { return !!this.player?.joined; }
  set joined(v: boolean) { if (this.player) this.player.joined = v; }

  private _lf2_listener: Partial<ILf2Callback> = {
    on_cheat_changed: (cheat_name, enabled) => { // 当前选择的角色被隐藏时，让玩家选随机
      if (cheat_name === Defines.Cheats.Hidden && !enabled) this.handle_hidden_character();
    },
  };

  init(...args: string[]): this {
    this._player_id = args[0];
    return this;
  }

  on_mount(): void {
    if (!this._player_id) return;
    this.lf2.callbacks.add(this._lf2_listener)
    if (!this.lf2.is_cheat_enabled(Defines.Cheats.Hidden))
      this.handle_hidden_character();
    GamePrepareLogic.inst?.callbacks.add(this._game_prepare_logic_listener);
  }

  on_unmount(): void {
    this.joined = false;
    this.character_decided = false;
    this.team_decided = false;
    this.lf2.callbacks.del(this._lf2_listener)
    GamePrepareLogic.inst?.callbacks.del(this._game_prepare_logic_listener);
  }

  get_characters() {
    const all_characters = this.lf2.dat_mgr.characters
    const show_all = this.lf2.is_cheat_enabled(Defines.Cheats.Hidden)
    return show_all ? all_characters : all_characters.filter(v => !v.base.hidden);
  }

  on_player_key_down(player_id: string, key: TKeyName): void {
    if (player_id !== this._player_id)
      return;
    if (this.team_decided) {
      if (key === 'j') {
        this.lf2.sound_mgr.play_preset('cancel')
        this.team_decided = false;
      }
    } else if (this.character_decided) {
      switch (key) {
        case 'a': { // 按攻击确认队伍
          this.lf2.sound_mgr.play_preset('join')
          this.team_decided = true;
          break;
        }
        case 'j': { // 按跳跃取消确认角色
          this.lf2.sound_mgr.play_preset('cancel')
          this.character_decided = false;
          break;
        }
        case 'L': { // 上一个队伍
          const idx = Defines.Teams.findIndex(v => v === this.team);
          const next_idx = (idx + Defines.Teams.length - 1) % Defines.Teams.length;
          this.team = Defines.Teams[next_idx];
          break;
        }
        case 'R': { // 下一个队伍
          const idx = Defines.Teams.findIndex(v => v === this.team);
          const next_idx = (idx + 1) % Defines.Teams.length;
          this.team = Defines.Teams[next_idx];
          break;
        }
      }
    } else if (this.joined) {
      switch (key) {
        case 'a': {  // 按攻击确认角色
          this.lf2.sound_mgr.play_preset('join')
          this.character_decided = true;
          break;
        }
        case 'j': { // 按跳跃取消加入
          this.lf2.sound_mgr.play_preset('cancel')
          this.joined = false;
          break;
        }
        case 'D':
        case 'U': { // 按上或下,回到随机
          this.character = '';
          break;
        }
        case 'L': { // 上一个角色
          const characters = this.get_characters();
          const idx = characters.findIndex(v => v.id === this.character);
          const next_idx = idx <= -1 ? characters.length - 1 : idx - 1;
          this.character = characters[next_idx]?.id ?? '';
          break;
        }
        case 'R': { // 下一个角色
          const arr = this.get_characters();
          const idx = arr.findIndex(v => v.id === this.character);
          const next = idx >= arr.length - 1 ? -1 : idx + 1;
          this.character = arr[next]?.id ?? '';
          break;
        }
      }
    } else {
      if (key === 'a') {
        this.lf2.sound_mgr.play_preset('join')
        this.joined = true;
      }
    }
  }
  /**
   * 当前选择的角色被隐藏时，让玩家选随机
   *
   * @protected
   */
  protected handle_hidden_character() {
    const all_characters = this.lf2.dat_mgr.characters
    const show_all = this.lf2.is_cheat_enabled(Defines.Cheats.Hidden)
    const characters = show_all ? all_characters : all_characters.filter(v => !v.base.hidden);
    const idx = characters.findIndex(v => v.id === this.character);
    this.player?.set_character(characters[idx]?.id ?? '');
  }

  protected on_not_all_player_ready(): void {
    console.log('on_not_all_player_ready')
    // throw new Error('Method not implemented.');
  }
  protected on_all_player_ready(): void {
    console.log('on_all_player_ready')
    // throw new Error('Method not implemented.');
  }

  protected on_countdown(v: number): void {
    console.log('on_countdown', v)
  }

}