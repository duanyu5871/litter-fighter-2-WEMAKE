import type { IMeshNode } from "../../LF2/3d/IMesh";
import Background from "../../LF2/bg/Background";
import Ditto from "../../LF2/ditto";
import type { IEntityRenderer } from "../../LF2/ditto/render/IEntityRenderer";
import type { Entity } from "../../LF2/entity/Entity";
import type { Stage } from "../../LF2/stage/Stage";
import * as T from "../3d/_t";

export class EntityShadowRender implements IEntityRenderer {
  readonly renderer_type: string = "Shadow";
  readonly mesh: IMeshNode;
  readonly entity: Entity;
  get world() { return this.entity.world }
  get lf2() { return this.entity.lf2 }
  bg: Readonly<Background> | undefined = void 0
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
    this.mesh.name = EntityShadowRender.name;
    this.mesh.render_order = 0;
  }

  on_mount() {
    this.entity.world.renderer.scene.add(this.mesh);
  }

  on_unmount() {
    this.mesh.dispose();
  }


  render() {
    const { bg } = this.world
    if (bg != this.bg) {
      this.bg = this.entity.world.bg;
      const pic = this.lf2.images.create_pic_by_img_key(bg.data.base.shadow);
      const [sw, sh] = bg.data.base.shadowsize || [30, 30];
      this.mesh.geometry = new T.PlaneGeometry(sw, sh);
      this.material.map = pic.texture;
      this.material.opacity = 1;
      this.material.needsUpdate = true;
    }


    const {
      frame,
      position: { x, z },
      invisible
    } = this.entity;
    this.mesh.set_position(
      Math.floor(x),
      Math.floor(-z / 2),
      Math.floor(z - 550),
    );
    this.mesh.visible = !invisible && !frame.no_shadow;
  }
}

export default EntityShadowRender