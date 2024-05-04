import * as T from 'three';
import type { IWorldCallbacks } from '../IWorldCallbacks';
import type Entity from './Entity';
import type Stage from '../stage/Stage';

/**
 * 场上物品的阴影
 */
export default class Shadow implements IWorldCallbacks {

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
    entity.world.callbacks.add(this);
    this.on_stage_change(entity.world.stage);
  }

  protected on_unmount(entity: Entity) {
    this.mesh.removeFromParent()
    entity.world.callbacks.del(this);
  }

  on_stage_change(stage: Stage): void {
    const bg = stage.bg
    bg.get_shadow().then(pic => {
      if (bg !== stage.bg) return;
      const [sw, sh] = bg.data.base.shadowsize || [30, 30];
      this.mesh.geometry = new T.PlaneGeometry(sw, sh);
      this.mesh.material.map = pic.texture;
      this.mesh.material.opacity = 1;
      this.mesh.material.needsUpdate = true;
    });
  }
}