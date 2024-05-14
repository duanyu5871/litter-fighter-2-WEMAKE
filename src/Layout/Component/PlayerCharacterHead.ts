import type { IPlayerInfoCallback } from "../../LF2/PlayerInfo";
import { TPicture } from '../../LF2/loader/loader';
import { Defines } from '../../common/lf2_type/defines';
import GamePrepareLogic, { GamePrepareState, IGamePrepareLogicCallback } from './GamePrepareLogic';
import { LayoutComponent } from "./LayoutComponent";
import Sprite from './Sprite';

/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterHead extends LayoutComponent {
  protected get _player_id() { return this.args[0] || '' }
  protected get _player() { return this.lf2.player_infos.get(this._player_id) }

  protected _jid: number = 0;
  protected _mesh_head?: Sprite;
  protected _mesh_hints?: Sprite;
  protected _mesh_cd?: Sprite;
  protected _head: string = Defines.BuiltIn.Imgs.RFACE;

  get gpl(): GamePrepareLogic | undefined {
    return this.layout.root.find_component(GamePrepareLogic)
  };

  get joined(): boolean { return true === this._player?.joined }

  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: () => this.handle_changed(),
    on_character_changed: (character_id): void => {
      const character = character_id ? this.lf2.datas.find_character(character_id) : void 0;
      this._head = character?.base.head || Defines.BuiltIn.Imgs.RFACE;
      this.handle_changed();
    }
  }
  private _game_prepare_logic_listener: Partial<IGamePrepareLogicCallback> = {
    on_countdown: (seconds) => {
      if (this.joined || !seconds) {
        this.release_countdown_mesh();
        return;
      }
      const pic = this.lf2.images.create_pic_by_img_key(`sprite/CM${seconds}.png`);
      if (!this._mesh_cd) {
        const [w, h] = this.layout.size;
        this._mesh_cd = new Sprite(pic)
          .set_center(0.5, 0.5)
          .set_size(pic.w, pic.h)
          .set_pos(w / 2, -h / 2)
          .set_name('countdown')
          .apply();
        this.layout.mesh?.add(this._mesh_cd.mesh);
      } else {
        this._mesh_cd.set_info(pic).apply();
      }

    },
    on_all_ready: () => {
      if (this._mesh_hints) this._mesh_hints.visible = false;
    },
    on_not_ready: () => {
      this.release_countdown_mesh();
      if (this._mesh_hints && !this._player?.joined) this._mesh_hints.visible = true;
    },
    on_asking_com_num: () => {
      this.release_countdown_mesh();
      if (this._mesh_hints && !this._player?.joined) this._mesh_hints.visible = true;
    }
  };


  static hint_pic: TPicture | null = null;
  protected release_countdown_mesh(): void {
    this._mesh_cd?.dispose();
    this._mesh_cd = void 0;
  }
  create_hints_mesh() {
    const [w, h] = this.layout.size
    const hint_pic = this.lf2.images.create_pic_by_img_key(Defines.BuiltIn.Imgs.CMA);

    this._mesh_hints = new Sprite(hint_pic)
      .set_center(.5, .5)
      .set_pos(w / 2, -h / 2)
      .set_visible(!this._player?.joined)
      .apply();

    this.layout.mesh?.add(this._mesh_hints.mesh)
  }

  override on_mount(): void {
    super.on_mount();
    this.create_hints_mesh();
    const player = this._player
    if (player) {
      player.callbacks.add(this._player_listener);
      this._player_listener.on_character_changed?.(player.character, '');
    }
    this.gpl?.callbacks.add(this._game_prepare_logic_listener);
  }

  override on_unmount(): void {
    super.on_unmount();
    if (!this._player) return;
    this._player.callbacks.del(this._player_listener);
    this.dispose_mesh();
    this.gpl?.callbacks.del(this._game_prepare_logic_listener);
  }

  protected handle_changed() {
    this.update_head_mesh(++this._jid, this._head)
  }

  protected dispose_mesh() {
    this._mesh_head?.dispose();
    this._mesh_head = void 0;
  }

  protected update_head_mesh(jid: number, src: string) {
    if (jid !== this._jid) return;
    const pic = this.lf2.images.create_pic_by_img_key(src);
    if (jid !== this._jid) {
      pic.texture.dispose();
      return;
    }
    if (!this._mesh_head) {
      this._mesh_head = new Sprite(pic)
        .set_size(...this.layout.size)
        .set_name(PlayerCharacterHead.name)
        .apply();
      this.layout.mesh?.add(this._mesh_head.mesh);
    } else {
      this._mesh_head.set_info(pic).apply();
    }
  }

  on_render(dt: number): void {
    const joined = this.joined;
    switch (this.gpl?.state) {
      case GamePrepareState.PlayerCharacterSel:
        if (this._mesh_hints) this._mesh_hints.visible = !joined
        if (this._mesh_head) this._mesh_head.visible = joined;
        if (this._mesh_cd) this._mesh_cd.visible = false;
        break;
      case GamePrepareState.CountingDown:
        if (this._mesh_hints) this._mesh_hints.visible = false
        if (this._mesh_head) this._mesh_head.visible = joined;
        if (this._mesh_cd) this._mesh_cd.visible = !joined;
        break;
      case GamePrepareState.ComNumberSel:
      case GamePrepareState.ComputerCharacterSel:
      case GamePrepareState.GameSetting:
        if (this._mesh_hints) this._mesh_hints.visible = false
        if (this._mesh_head) this._mesh_head.visible = joined;
        if (this._mesh_cd) this._mesh_cd.visible = false;
        break;
    }
  }
}