import * as T from "./_t";
import { IMeshNode } from "../3d/IMesh";
import Ditto from "../ditto";
import type Entity from "../entity/Entity";
import type { IWorldCallbacks } from "../IWorldCallbacks";
import type Stage from "../stage/Stage";

/**
 * 场上物品的阴影
 */
export default class Shadow {
  protected world_listener: IWorldCallbacks = {
    on_stage_change: (v) => this.on_stage_change(v),
  };
  mesh: IMeshNode;
  protected material = new T.MeshBasicMaterial({
    transparent: true,
    opacity: 0,
  });
  get visible() {
    return this.mesh.visible;
  }
  set visible(v) {
    this.mesh.visible = v;
  }
  constructor(entity: Entity, entity_mesh: IMeshNode) {
    const { lf2 } = entity;
    this.mesh = new Ditto.MeshNode(lf2, {
      geometry: new T.PlaneGeometry(0, 0),
      material: this.material,
    });
    this.mesh.name = Shadow.name;
    this.mesh.render_order = 0;
    entity_mesh.on("added", () => this.on_mount(entity));
    entity_mesh.on("removed", () => this.on_unmount(entity));
  }

  protected on_mount(entity: Entity) {
    entity.world.scene.add(this.mesh);
    entity.world.callbacks.add(this.world_listener);
    this.on_stage_change(entity.world.stage);
  }

  protected on_unmount(entity: Entity) {
    this.mesh.dispose();
    entity.world.callbacks.del(this.world_listener);
  }

  protected on_stage_change(stage: Stage): void {
    const bg = stage.bg;
    const pic = stage.lf2.images.create_pic_by_img_key(bg.data.base.shadow);
    if (bg !== stage.bg) return;
    const [sw, sh] = bg.data.base.shadowsize || [30, 30];
    this.mesh.geometry = new T.PlaneGeometry(sw, sh);
    this.material.map = pic.texture;
    this.material.opacity = 1;
    this.material.needsUpdate = true;
  }
}
