import * as THREE from 'three';
import type { IPlayerInfoCallback, PlayerInfo } from "../../PlayerInfo";
import { dispose_mesh } from '../utils/dispose_mesh';
import { LayoutComponent } from "./LayoutComponent";
import { TextBuilder } from './TextBuilder';
import { SineAnimation } from '../../animation/SineAnimation';
import Invoker from '../../base/Invoker';

/**
 * 显示玩家角色选择的角色名称
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerCharacterName extends LayoutComponent {
  get player_id() { return this.args[0] || '' }
  get player() { return this.lf2.player_infos.get(this.player_id) }
  get joined(): boolean { return !!this.player?.joined }
  get text(): string {
    const character_id = this.player?.character;
    const character = character_id ? this.lf2.datas.find_character(character_id) : void 0;
    return character?.base.name ?? 'Random'
  }
  protected _jid: number = 0;
  protected _mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _opacity: SineAnimation = new SineAnimation(0.65, 1, 1 / 25);
  protected _text: string | undefined = void 0;
  protected _unmount_jobs = new Invoker()

  override on_mount(): void {
    super.on_mount();
    this._unmount_jobs.add(
      this.player?.callbacks.add({
        on_joined_changed: () => this.handle_changed(),
        on_character_changed: (): void => this.handle_changed(),
        on_random_character_changed: () => this.handle_changed(),
      }),
      () => this._mesh?.removeFromParent()
    )
    this.handle_changed();
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke();
    this._unmount_jobs.clear();
  }


  protected handle_changed() {
    if (this.joined && this._text) {
      this.update_mesh(++this._jid, this._text)
    } else {
      this.dispose_mesh();
    }
  }
  protected dispose_mesh() {
    this._mesh && dispose_mesh(this._mesh);
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
      this.layout.sprite.mesh.add(this._mesh);
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
      this._mesh.material.opacity = this.player?.character_decided ? 1 : this._opacity.value;
      this._mesh.material.needsUpdate = true;
    }
  }
}