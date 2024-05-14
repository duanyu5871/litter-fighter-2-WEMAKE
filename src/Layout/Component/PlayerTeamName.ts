import * as THREE from 'three';
import Invoker from '../../LF2/base/Invoker';
import { SineAnimation } from '../../SineAnimation';
import { Defines } from '../../common/lf2_type/defines';
import { dispose_mesh } from '../utils/dispose_mesh';
import { LayoutComponent } from "./LayoutComponent";
import { TextBuilder } from './TextBuilder';

/**
 * 显示玩家队伍名
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerTeamName extends LayoutComponent {
  protected get player_id() { return this.args[0] || '' }
  protected get player() { return this.lf2.player_infos.get(this.player_id) }
  protected _jid: number = 0;
  protected _mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _opacity: SineAnimation = new SineAnimation(0.75, 1, 1 / 50);
  protected get show(): boolean { return !!this.player?.character_decided }
  protected get team(): string | undefined { return this.player?.team; }
  protected get text(): string | undefined {
    const { team } = this;
    if (team === void 0) return void 0;
    return Defines.TeamInfoMap[team]?.name;
  };

  protected _unmount_jobs = new Invoker();

  override on_mount(): void {
    super.on_mount();
    this._unmount_jobs.add(
      this.player?.callbacks.add({
        on_character_decided: () => this.handle_changed(),
        on_team_changed: () => this.handle_changed(),
      }),
      () => this.dispose_mesh()
    )
    this.handle_changed();
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke();
    this._unmount_jobs.clear();
  }

  protected dispose_mesh(): void {
    this._mesh && dispose_mesh(this._mesh);
    this._mesh = void 0;
  }

  protected handle_changed() {
    const { text, show } = this;
    if (show && text) {
      this.update_mesh(++this._jid, text)
    } else {
      this.dispose_mesh();
    }
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
      this._mesh.name = PlayerTeamName.name
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
      this._mesh.material.opacity = this.player?.team_decided ? 1 : this._opacity.value;
      this._mesh.material.needsUpdate = true;
    }
  }
}