import * as THREE from 'three';
import Invoker from '../../base/Invoker';
import { dispose_mesh } from '../utils/dispose_mesh';
import GamePrepareLogic, { GamePrepareState } from './GamePrepareLogic';
import { LayoutComponent } from "./LayoutComponent";
import { TextBuilder } from './TextBuilder';
import { SineAnimation } from '../../animation/SineAnimation';

/**
 * 显示玩家名称
 *
 * @export
 * @class PlayerCharacterHead
 * @extends {LayoutComponent}
 */
export default class PlayerName extends LayoutComponent {
  protected get player_id() { return this.args[0] || '' }
  protected get player() { return this.lf2.player_infos.get(this.player_id) }
  protected get text(): string {
    const { player, gpl } = this;
    if (!gpl) return ''
    const { state } = gpl;
    if (player?.is_com) return 'Computer'
    if (player?.joined) return player.name
    if (state === GamePrepareState.PlayerCharacterSel) return 'Join?';
    return ''
  }
  get joined(): boolean { return true === this.player?.joined }
  get is_com(): boolean { return true === this.player?.is_com }
  
  get gpl(): GamePrepareLogic | undefined { return this.layout.root.find_component(GamePrepareLogic) }
  protected _jid: number = 0;
  protected _mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> | undefined
  protected _opacity: SineAnimation = new SineAnimation(0.65, 1, 1 / 25);
  protected _character_id: string | undefined = void 0;
  protected _unmount_jobs = new Invoker();
  protected _dirty = false;
  override on_mount(): void {
    super.on_mount();
    this._unmount_jobs.add(
      this.player?.callbacks.add({
        on_is_com_changed: () => this._dirty = true,
        on_joined_changed: () => this._dirty = true,
        on_name_changed: () => this._dirty = true,
      }),
      this.gpl?.fsm.callbacks.add({
        on_state_changed: () => this._dirty = true
      }),
      () => this.dispose_mesh(),
    )
    this.handle_dirty();
  }

  override on_unmount(): void {
    super.on_unmount();
    this._unmount_jobs.invoke();
    this._unmount_jobs.clear();
  }

  protected handle_dirty() {
    this.update_name_mesh(++this._jid, this.text).catch(e => console.error(e));

  }

  protected dispose_mesh() {
    this._mesh && dispose_mesh(this._mesh);
    this._mesh = void 0;
  }

  protected async update_name_mesh(jid: number, name: string) {
    if (jid !== this._jid) return;
    const [w, h] = this.layout.size;
    const builder = TextBuilder.get(this.lf2)
      .pos(w / 2, -h / 2)
      .center(0.5, 0.5)
      .text(name)
      .style({
        fill_style: 'white',
        font: '14px Arial',
      });
    if (!this._mesh) {
      const mesh = await builder.build_mesh();
      if (jid !== this._jid) {
        mesh.geometry.dispose();
        mesh.material.dispose();
        return;
      }
      this._mesh = mesh;
      this._mesh.name = PlayerName.name
      this.layout.sprite.mesh.add(mesh);
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
    if (this._dirty) { this.handle_dirty(); this._dirty = false; }

    this._opacity.update(dt)
    if (this._mesh) {
      this._mesh.material.opacity = this.player?.joined ? 1 : this._opacity.value;
      this._mesh.material.needsUpdate = true;
    }
    const { joined, is_com } = this;
    switch (this.gpl?.state) {
      case GamePrepareState.PlayerCharacterSel:
        if (this._mesh) this._mesh.visible = true;
        break;
      case GamePrepareState.CountingDown:
      case GamePrepareState.ComNumberSel:
        if (this._mesh) this._mesh.visible = joined;
        break;
      case GamePrepareState.ComputerCharacterSel:
      case GamePrepareState.GameSetting:
        if (this._mesh) this._mesh.visible = joined || is_com;
        break;
    }
  }
}