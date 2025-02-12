import { IMeshNode } from "../../LF2/3d/IMesh";
import Ditto from "../../LF2/ditto";
import { IShadowRender } from "../../LF2/ditto/render/IShadowRender";
import type Entity from "../../LF2/entity/Entity";
import type Stage from "../../LF2/stage/Stage";
import * as T from "./_t";

export class ShadowRender implements IShadowRender {
  mesh: IMeshNode;
  entity: Entity;
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
  constructor(entity: Entity) {
    const { lf2 } = entity;
    this.entity = entity
    this.mesh = new Ditto.MeshNode(lf2, {
      geometry: new T.PlaneGeometry(0, 0),
      material: this.material,
    });
    this.mesh.name = ShadowRender.name;
    this.mesh.render_order = 0;
  }

  on_mount() {
    this.entity.world.scene.add(this.mesh);
    this.entity.world.callbacks.add(this)
  }

  on_unmount() {
    this.mesh.dispose();
    this.entity.world.callbacks.del(this)
  }

  on_stage_change(stage: Stage): void {
    const bg = stage.bg;
    const pic = stage.lf2.images.create_pic_by_img_key(bg.data.base.shadow);
    if (bg !== stage.bg) return;
    const [sw, sh] = bg.data.base.shadowsize || [30, 30];
    this.mesh.geometry = new T.PlaneGeometry(sw, sh);
    this.material.map = pic.texture;
    this.material.opacity = 1;
    this.material.needsUpdate = true;
  }

  update() {
    const {
      frame,
      position: { x, z },
      invisible
    } = this.entity;
    this.mesh.set_position(
      Math.round(x),
      Math.round(-z / 2),
      Math.round(z - 550),
    );
    this.mesh.visible = !invisible && !frame.no_shadow;
  }
}

export default ShadowRender