import * as THREE from 'three';
import type { IPlayerInfoCallback, PlayerInfo } from "../../LF2/PlayerInfo";
import { Warn } from '../../Log';
import NumberAnimation from "../../NumberAnimation";
import { SineAnimation } from '../../SineAnimation';
import { LayoutComponent } from "./LayoutComponent";
import LayoutMeshBuilder from "./LayoutMeshBuilder";

/**
 * 显示玩家角色选择的角色头像
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterHead extends LayoutComponent {
  protected _player_id: string | undefined = void 0;
  protected _player: PlayerInfo | undefined = void 0;
  protected _jid: number = 0;
  protected _mesh_head: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _mesh_join: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _head_opacity: NumberAnimation = new NumberAnimation(0, 1, 0, false);
  protected _head: string = 'sprite/RFACE.png';
  protected _hints_opacity: SineAnimation = new SineAnimation(0.75, 1, 1 / 50);

  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: () => this.handle_changed(),
    on_character_changed: (character_id): void => {
      const character = character_id ? this.lf2.dat_mgr.find_character(character_id) : void 0;
      this._head = character?.base.head || 'sprite/RFACE.png';
      this.handle_changed();
    }
  }

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
      .build({ map: hint_textures.texture, transparent: true });
    this._mesh_join.position.set(w / 2, -h / 2, 0);
    this.layout.mesh?.add(this._mesh_join)
    this._mesh_join.visible = !this._player?.joined
  }

  on_mount(): void {
    this.create_hints_mesh();
    if (!this._player_id) return;
    this._player = this.lf2.player_infos.get(this._player_id);
    if (!this._player) return;
    this._player.callbacks.add(this._player_listener);
    this._player_listener.on_character_changed?.(this._player.character, '');
  }

  on_unmount(): void {
    if (!this._player) return;
    this._player.callbacks.del(this._player_listener);
    this.dispose_mesh();
  }

  protected handle_changed() {
    if (!this._mesh_head && this._player?.joined) {
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
    if (jid !== this._jid) {
      pic.texture.dispose();
      return;
    }
    const [w, h] = this.layout.size
    const builder = LayoutMeshBuilder.create().size(w, h);
    if (!this._mesh_head) {
      this._mesh_head = builder.build({ map: pic.texture, transparent: true });
      this._mesh_head.name = PlayerCharacterHead.name
      this.layout.mesh?.add(this._mesh_head);
    } else {
      this._mesh_head.geometry.dispose();
      this._mesh_head.material.map?.dispose();
      this._mesh_head.geometry = builder.build_geometry()
      this._mesh_head.material.map = pic.texture;
      this._mesh_head.material.needsUpdate = true;
    }
  }

  on_render(dt: number): void {
    this._hints_opacity.update(dt)
    if (this._mesh_head) {
      this._mesh_head.material.opacity = this._head_opacity.update(dt);
      this._mesh_head.material.needsUpdate = true;
    }
    if (this._head_opacity.is_finish && this._head_opacity.reverse) {
      if (!this._head || !this._player?.joined) {
        if (this._mesh_join) this._mesh_join.visible = true
        this.dispose_mesh();
      } else {
        if (this._mesh_join) this._mesh_join.visible = false
        this.update_head_mesh(++this._jid, this._head).catch(e => Warn.print(PlayerCharacterHead.name, 'failed to update head, reason:', e))
        this._head_opacity.play(false);
      }
    }
    if (this._mesh_join) {
      this._mesh_join.material.opacity = this._hints_opacity.value;
    }
  }
}