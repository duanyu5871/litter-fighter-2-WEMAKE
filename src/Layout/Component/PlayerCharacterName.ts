import * as THREE from 'three';
import type { IPlayerInfoCallback, PlayerInfo } from "../../LF2/PlayerInfo";
import { SineAnimation } from '../../SineAnimation';
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
  protected _opacity: SineAnimation = new SineAnimation(0.75, 1, 1 / 50);
  protected _text: string | undefined = void 0;
  protected _show: boolean = false;

  protected _player_listener: Partial<IPlayerInfoCallback> = {
    on_joined_changed: (joined) => {
      if (this._show === joined) return;
      this._show = joined;
      this.handle_changed();
    },
    on_character_changed: (character_id): void => {
      const name = this.get_text(character_id)
      if (this._text === name) return;
      this._text = name;
      this.handle_changed();
    }
  }

  init(...args: string[]): this {
    this._player_id = args[0];
    return this;
  }

  get_text(character_id: string | undefined) {
    const character = character_id ? this.lf2.dat_mgr.find_character(character_id) : void 0;
    return character?.base.name ?? 'Random'
  }

  on_mount(): void {
    if (!this._player_id) return;
    this._player = this.lf2.player_infos.get(this._player_id);
    if (!this._player) return;
    this._player.callbacks.add(this._player_listener);
    this._show = this._player.joined;
    this._text = this.get_text(this._player.character);
    this.handle_changed();
  }

  on_unmount(): void {
    if (!this._player) return;
    this._player.callbacks.del(this._player_listener);
    this.dispose_mesh();
  }


  protected handle_changed() {
    if (this._show && this._text) {
      this.update_mesh(++this._jid, this._text)
    } else {
      this.dispose_mesh();
    }
  }
  protected dispose_mesh() {
    this._mesh?.geometry.dispose();
    this._mesh?.material.map?.dispose();
    this._mesh?.removeFromParent();
    this._mesh = void 0;
  }

  protected async update_mesh(jid: number, name: string) {
    if (jid !== this._jid) return;
    const [w, h] = this.layout.size

    const builder = TextBuilder.get(this.lf2)
      .pos(w / 2, -h / 2)
      .center(0.5, 0.5)
      .text(name)
      .style({
        fill_style: 'white',
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
      this.layout.mesh?.add(this._mesh);
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
    this._opacity.update(dt)
    if (this._mesh) {
      this._mesh.material.opacity = this._player?.character_decided ? 1 : this._opacity.value;
      this._mesh.material.needsUpdate = true;
    }
  }
}