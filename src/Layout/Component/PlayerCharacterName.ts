import * as THREE from 'three';
import type { IPlayerInfoCallback, PlayerInfo } from "../../LF2/PlayerInfo";
import { Warn } from '../../Log';
import NumberAnimation from "../../NumberAnimation";
import { LayoutComponent } from "./LayoutComponent";
import { TextBuilder } from './TextBuilder';

/**
 * 显示玩家角色选择的角色名称
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterName extends LayoutComponent {
  protected _player_id: string | undefined = void 0;
  protected _player: PlayerInfo | undefined = void 0;
  protected _jid: number = 0;
  protected _mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _name_opacity: NumberAnimation = new NumberAnimation(0, 1, 0, false);
  protected _name: string | undefined = void 0;

  protected _character_id: string | undefined = void 0;

  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: () => this.handle_changed(),
    on_character_changed: (character_id): void => {
      const character = character_id ? this.lf2.dat_mgr.find_character(character_id) : void 0;
      this._character_id = character_id;
      this._name = character?.base.name ?? 'Random';
      this.handle_changed();
    }
  }

  init(...args: string[]): this {
    this._player_id = args[0];
    return this;
  }

  on_mount(): void {
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
    if (!this._mesh && this._player?.joined && this._name) {
      this.update_name_mesh(++this._jid, this._name).catch(e => console.error(e))
    } else {
      this.fade_out();
    }
  }
  protected dispose_mesh() {
    this._mesh?.geometry.dispose();
    this._mesh?.material.map?.dispose();
    this._mesh?.removeFromParent();
    this._mesh = void 0;
  }
  protected fade_out() {
    this._name_opacity.play(true);
  }
  protected async update_name_mesh(jid: number, name: string) {
    if (jid !== this._jid) return;
    const [w, h] = this.layout.size

    const builder = TextBuilder.get(this.lf2)
      .pos(w / 2, -h / 2)
      .center(0.5, 0.5)
      .text(name)
      .style({
        fillStyle: 'white',
        font: 'bold 14px Arial',
      });
    if (!this._mesh) {
      const mesh = await builder.build_mesh();
      if (jid !== this._jid) {
        mesh.geometry.dispose();
        mesh.material.dispose();
        return;
      }
      this._mesh = mesh;
      this._mesh.name = PlayerCharacterName.name
      this.layout.sprite?.add(this._mesh);
    } else {
      const [geo, tex] = await builder.build();
      if (jid !== this._jid) {
        geo.dispose();
        tex.dispose();
        return;
      }
      this._mesh.geometry.dispose();
      this._mesh.material.map?.dispose();
      this._mesh.geometry = geo
      this._mesh.material.map = tex;
      this._mesh.material.needsUpdate = true;
    }
  }

  on_render(dt: number): void {
    if (this._mesh) {
      this._mesh.material.opacity = this._name_opacity.update(dt);
      this._mesh.material.needsUpdate = true;
    }
    if (this._name_opacity.is_finish && this._name_opacity.reverse) {
      if (!this._name || !this._player?.joined) {
        this.dispose_mesh();
      } else {
        this.update_name_mesh(++this._jid, this._name).catch(e => Warn.print(PlayerCharacterName.name, 'failed to update name, reason:', e))
        this._name_opacity.play(false);
      }
    }
  }
}