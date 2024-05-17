import * as T from 'three';
import { dispose_mesh } from '../layout/utils/dispose_mesh';
import type { IWorldCallbacks } from '../IWorldCallbacks';
import type Stage from '../stage/Stage';
import type Entity from './Entity';

/**
 * 场上物品的阴影
 */
export default class Shadow {
  protected world_listener: IWorldCallbacks = {
    on_stage_change: v => this.on_stage_change(v)
  }
  protected mesh: T.Mesh<T.PlaneGeometry, T.MeshBasicMaterial> = new T.Mesh(
    new T.PlaneGeometry(0, 0),
    new T.MeshBasicMaterial({ transparent: true, opacity: 0 })
  );

  get position() { return this.mesh.position; }
  get visible() { return this.mesh.visible; }
  set visible(v) { this.mesh.visible = v; }

  constructor(entity: Entity) {
    this.mesh.name = Shadow.name;
    this.mesh.renderOrder = 0;
    entity.mesh.addEventListener('added', () => this.on_mount(entity))
    entity.mesh.addEventListener('removed', () => this.on_unmount(entity))
  }

  protected on_mount(entity: Entity) {
    entity.world.scene.add(this.mesh)
    entity.world.callbacks.add(this.world_listener);
    this.on_stage_change(entity.world.stage);
  }

  protected on_unmount(entity: Entity) {
    dispose_mesh(this.mesh)
    entity.world.callbacks.del(this.world_listener);
  }

  protected on_stage_change(stage: Stage): void {
    const bg = stage.bg
    const pic = bg.get_shadow()
    if (bg !== stage.bg) return;
    const [sw, sh] = bg.data.base.shadowsize || [30, 30];
    this.mesh.geometry = new T.PlaneGeometry(sw, sh);
    this.mesh.material.map = pic.texture;
    this.mesh.material.opacity = 1;
    this.mesh.material.needsUpdate = true;
  }
}