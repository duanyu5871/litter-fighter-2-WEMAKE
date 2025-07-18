import type { IMeshNode } from "../../LF2/3d";
import type { IEntityData, IFrameInfo, IPicture, ITexturePieceInfo, TFace } from "../../LF2/defines";
import { Builtin_FrameId } from "../../LF2/defines";
import Ditto from "../../LF2/ditto";
import type { IEntityRenderer } from "../../LF2/ditto/render/IEntityRenderer";
import type Entity from "../../LF2/entity/Entity";
import create_pictures from "../../LF2/loader/create_pictures";
import * as THREE from "./_t";
export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: "0",
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  pixel_h: 0,
  pixel_w: 0,
};
export class EntityRender implements IEntityRenderer {
  readonly renderer_type: string = "Entity";
  protected pictures!: Map<string, IPicture<THREE.Texture>>;
  protected entity!: Entity;
  protected entity_mesh!: IMeshNode;
  protected entity_material!: THREE.MeshBasicMaterial;
  protected variants = new Map<string, string[]>();
  protected piece: ITexturePieceInfo = EMPTY_PIECE;
  protected _prev_update_count?: number;
  protected _shaking?: number;
  protected _prev_data?: IEntityData;
  constructor(entity: Entity) {
    this.set_entity(entity);
  }

  set_entity(entity: Entity): EntityRender {
    const { world, lf2, data } = (this.entity = entity);
    this.variants.clear();
    for (const k in data.base.files) {
      if (data.base.files[k].variants)
        this.variants.set(k, [k, ...data.base.files[k].variants]);
      else this.variants.set(k, [k]);
    }
    this._prev_data = entity.data;
    this.pictures = create_pictures(lf2, entity.data);
    const first_text = this.pictures.get("0")?.texture;
    const inner = (this.entity_mesh =
      this.entity_mesh ||
      new Ditto.MeshNode(world.lf2, {
        geometry: new THREE.PlaneGeometry(1, 1).translate(0.5, -0.5, 0),
        material: (this.entity_material = new THREE.MeshBasicMaterial({
          map: first_text,
          transparent: true,
        })),
      }));
    if (first_text) first_text.onUpdate = () => inner.update_all_material();
    this.entity_mesh.user_data.owner = this;
    this.entity_mesh.visible = false;
    this.entity_mesh.name = "Entity:" + data.id;
    if (typeof data.base.depth_test === "boolean") {
      this.entity_mesh.set_depth_test(data.base.depth_test);
    }
    if (typeof data.base.depth_write === "boolean") {
      this.entity_mesh.set_depth_write(data.base.depth_write);
    }
    if (typeof data.base.render_order === "number") {
      this.entity_mesh.render_order = data.base.render_order;
    }
    return this;
  }
  get visible(): boolean {
    return this.entity_mesh.visible;
  }
  set visible(v: boolean) {
    this.entity_mesh.visible = v;
  }
  on_mount() {
    this.entity.world.scene.add(this.entity_mesh!);
  }
  on_unmount(): void {
    this.entity_mesh.dispose();
    if (this.pictures)
      for (const [, pic] of this.pictures) pic.texture.dispose();
  }
  private _prev_tex?: ITexturePieceInfo

  apply_tex(entity: Entity, info: ITexturePieceInfo | undefined) {
    const { pictures, entity_material, entity_mesh } = this
    if (info) {
      const { x, y, w, h, tex, pixel_w, pixel_h } = info;
      const real_tex = this.variants.get(tex)?.at(entity.variant) ?? tex;
      const pic = pictures.get(real_tex);
      if (pic) {
        pic.texture.offset.set(x, y);
        pic.texture.repeat.set(w, h);
        if (pic.texture !== entity_material.map) {
          entity_material.map = pic.texture;
        }
        entity_mesh.update_all_material();
      }
      entity_mesh.set_scale(pixel_w, pixel_h, 0);
    } else {
      entity_mesh.set_scale(0, 0, 0);
    }
  }

  render() {
    const { entity, entity_mesh } = this;
    if (entity.frame.id === Builtin_FrameId.Gone) return;
    const { frame, position: { x, y, z }, facing } = entity;
    if (entity.data !== this._prev_data) {
      this.set_entity(entity);
    }
    if (this._prev_update_count === entity.update_id)
      return;
    this._prev_update_count = entity.update_id;
    
    const tex = frame.pic?.[facing]
    if (this._prev_tex !== tex) {
      this.apply_tex(entity, this._prev_tex = tex)
    }

    const { centerx, centery } = frame;
    const offset_x = entity.facing === 1 ? centerx : entity_mesh.scale_x - centerx;
    entity_mesh.set_position(
      Math.round(x - offset_x),
      Math.round(y - z / 2 + centery),
      Math.round(z),
    );
    const is_visible = !entity.invisible;
    const is_blinking = !!entity.blinking;
    entity_mesh.visible = is_visible;
    if (is_blinking && is_visible) {
      entity_mesh.visible = 0 === Math.floor(entity.blinking / 4) % 2;
    }

    if (entity.shaking && this._shaking !== entity.shaking) {
      const x = entity.shaking % 2 ? -4 : 4;
      entity_mesh.x += facing * x;
    }
    this._shaking = entity.shaking;


  }
}
