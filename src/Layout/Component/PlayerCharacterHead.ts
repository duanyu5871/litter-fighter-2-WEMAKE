import * as THREE from 'three';
import type { IPlayerInfoCallback, PlayerInfo } from "../../LF2/PlayerInfo";
import NumberAnimation from "../../NumberAnimation";
import { LayoutComponent } from "./LayoutComponent";
import LayoutMeshBuilder from "./LayoutMeshBuilder";
import { TKeyName } from '../../LF2/controller/BaseController';
import { Defines } from '../../common/lf2_type/defines';
import { ILf2Callback } from '../../LF2/ILf2Callback';
import { SineAnimation } from '../../SineAnimation';
import { Warn } from '../../Log';

/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class PlayerCharacterHead
 * @typedef {PlayerCharacterHead}
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterHead extends LayoutComponent {
  protected _player_id: string | undefined = void 0;
  protected _player: PlayerInfo | undefined = void 0;
  protected _jid: number = 0;
  protected _mesh_head: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _mesh_join: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _head_opacity: NumberAnimation = new NumberAnimation(0, 1, 60, false);
  protected _head: string | undefined = void 0;
  protected _joined: boolean = false;
  protected _character_id: string | undefined = void 0;
  protected _hints_opacity: SineAnimation = new SineAnimation(0.85, 1, 1 / 25);

  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: (joined): void => {
      this._joined = joined;
      this.handle_changed();
    },
    on_character_changed: (character_id): void => {
      const character = character_id ? this.lf2.dat_mgr.find_character(character_id) : void 0;
      this._character_id = character_id;
      this._head = character?.base.head || 'sprite/RFACE.png';
      this.handle_changed();
    }
  }
  private _lf2_listener: Partial<ILf2Callback> = {
    on_cheat_changed: (cheat_name, enabled) => {
      // 当前选择的角色被隐藏时，让玩家选随机
      if (cheat_name === Defines.Cheats.Hidden && !enabled) this.handle_hidden_character();
    },
  };

  init(...args: string[]): this {
    this._player_id = args[0];
    return this;
  }

  async create_hints_mesh() {
    const [w, h] = this.layout.size
    const src = 'sprite/CMA.png'
    const hint_textures = await this.lf2.img_mgr.create_picture(src);
    this._mesh_join = LayoutMeshBuilder.create()
      .center(0.5, 0.5)
      .size(hint_textures.i_w, hint_textures.i_h)
      .build(hint_textures.texture);
    this._mesh_join.position.set(w / 2, -h / 2, 0);
    this.layout.sprite?.add(this._mesh_join)
    this._mesh_join.visible = !this._player?.joined
  }

  on_mount(): void {
    this.create_hints_mesh();
    if (!this._player_id) return;
    this._player = this.lf2.player_infos.get(this._player_id);
    if (!this._player) return;
    this._player.callbacks.add(this._player_listener);
    this.lf2.callbacks.add(this._lf2_listener)
    this._player_listener.on_character_changed?.(this._player.character, '');
    this._player_listener.on_joined_changed?.(this._player.joined);
  }

  on_unmount(): void {
    if (!this._player) return;
    this._player.callbacks.del(this._player_listener);
    this.dispose_mesh();
  }

  on_player_key_down(player_id: string, key: TKeyName): void {
    if (!this._player || player_id !== this._player_id)
      return;
    const all_characters = this.lf2.dat_mgr.characters
    const show_all = this.lf2.is_cheat_enabled(Defines.Cheats.Hidden)
    const characters = show_all ? all_characters : all_characters.filter(v => !v.base.hidden);
    const idx = characters.findIndex(v => v.id === this._character_id);
    if (!this._joined) {
      if (key === 'a') {
        this._player.set_joined(true);
      }
    } else if (key === 'U') { // 按上回到随机
      this._player.set_character('');
    } else if (key === 'j') { // 按跳跃取消加入
      this._player.set_joined(false);
    } else if (key === 'L') { // 上一个角色
      const next_idx = idx <= -1 ? characters.length - 1 : idx - 1;
      this._player.set_character(characters[next_idx]?.id ?? '');
    } else if (key === 'R') { // 下一个角色
      const next_idx = idx >= characters.length - 1 ? -1 : idx + 1;
      this._player.set_character(characters[next_idx]?.id ?? '');
    }
  }

  /**
   * 当前选择的角色被隐藏时，让玩家选随机
   *
   * @protected
   */
  protected handle_hidden_character() {
    if (!this._player) return;
    const all_characters = this.lf2.dat_mgr.characters
    const show_all = this.lf2.is_cheat_enabled(Defines.Cheats.Hidden)
    const characters = show_all ? all_characters : all_characters.filter(v => !v.base.hidden);
    const idx = characters.findIndex(v => v.id === this._character_id);
    this._player.set_character(characters[idx]?.id ?? '');
  }

  protected handle_changed() {
    if (!this._mesh_head && this._joined && this._head) {
      this.update_head_mesh(++this._jid, this._head).catch(e => console.error(e))
    } else {
      this.fade_out();
    }
  }
  protected dispose_mesh() {
    this._mesh_head?.geometry.dispose();
    this._mesh_head?.material.map?.dispose();
    this._mesh_head?.removeFromParent();
    this._mesh_head = void 0;
  }
  protected fade_out() {
    this._head_opacity.play(true);
  }
  protected async update_head_mesh(jid: number, src: string) {
    if (jid !== this._jid) return;
    const pic = await this.lf2.img_mgr.create_picture(src);
    if (jid !== this._jid) return;
    const [w, h] = this.layout.size
    const builder = LayoutMeshBuilder.create().size(w, h);
    if (!this._mesh_head) {
      this._mesh_head = builder.build(pic.texture);
      this._mesh_head.name = PlayerCharacterHead.name
      this.layout.sprite?.add(this._mesh_head);
    } else {
      this._mesh_head.geometry.dispose();
      this._mesh_head.material.map?.dispose();
      this._mesh_head.geometry = builder.build_geometry()
      this._mesh_head.material.map = pic.texture;
      this._mesh_head.material.needsUpdate = true;
    }
  }

  on_render(dt: number): void {
    if (this._mesh_head) {
      this._mesh_head.material.opacity = this._head_opacity.update(dt);
      this._mesh_head.material.needsUpdate = true;
    }
    if (this._head_opacity.is_finish && this._head_opacity.reverse) {
      if (!this._head || !this._joined) {
        if (this._mesh_join) this._mesh_join.visible = true
        this.dispose_mesh();
      } else {
        if (this._mesh_join) this._mesh_join.visible = false
        this.update_head_mesh(++this._jid, this._head).catch(e => Warn.print(PlayerCharacterHead.name, 'failed to update head, reason:', e))
        this._head_opacity.play(false);
      }
    }
    if (this._mesh_join?.visible) {
      this._mesh_join.material.opacity = this._hints_opacity.update(dt);
    }
  }
}