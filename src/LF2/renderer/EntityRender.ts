import * as THREE from "./_t";
import { IMeshNode } from "../3d";
import { Defines, IFrameInfo, ITexturePieceInfo, TFace } from "../defines";
import { IEntityData } from "../defines/IEntityData";
import IPicture from "../defines/IPicture";
import Ditto from "../ditto";
import Entity from "../entity/Entity";
import create_pictures from "../loader/create_pictures";
import { FrameIndicators } from "./FrameIndicators";
import { InfoRender } from "./InfoRender";
import Shadow from "./ShadowRender";
export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: "0",
  x: 0,
  y: 0,
  w: 0,
  h: 0,
  pixel_h: 0,
  pixel_w: 0,
};
export class EntityRender {
  protected pictures!: Map<string, IPicture<THREE.Texture>>;
  protected entity!: Entity;
  protected entity_mesh!: IMeshNode;
  protected entity_material!: THREE.MeshBasicMaterial;
  protected variants = new Map<string, string[]>();
  protected piece: ITexturePieceInfo = EMPTY_PIECE;
  protected shadow!: Shadow;
  readonly indicators!: FrameIndicators;
  protected _prev_update_count?: number;
  protected _shaking?: number;
  protected _prev_data?: IEntityData;
  protected _info_sprite: InfoRender;
  constructor(entity: Entity) {
    this.set_entity(entity);
    this.shadow = new Shadow(entity, this.entity_mesh);
    this.indicators = new FrameIndicators(entity, this.entity_mesh);
    this._info_sprite = new InfoRender(entity, this.entity_mesh);
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
  attach() {
    this.entity.world.scene.add(this.entity_mesh!);
  }
  private _previous = {
    face: void 0 as TFace | undefined,
    frame: void 0 as IFrameInfo | undefined,
    variant: 0,
  };
  update() {
    const { entity, entity_mesh, entity_material, pictures, shadow } = this;
    if (entity.frame.id === Defines.FrameId.Gone) {
      return;
    }
    const {
      frame,
      position: { x, y, z },
      facing,
    } = entity;
    if (entity.data !== this._prev_data) {
      this.set_entity(entity);
    }
    if (this._prev_update_count !== entity.update_id) {
      this.indicators.update();
      this._prev_update_count = entity.update_id;
      if (this._previous.face !== facing || this._previous.frame !== frame) {
        this._previous.face = facing;
        this._previous.frame = frame;
        const frame_pic = frame.pic;
        if (frame_pic && "-1" in frame_pic) {
          if (this.piece !== frame_pic[facing] && frame_pic[facing]) {
            const { x, y, w, h, tex, pixel_w, pixel_h } = (this.piece =
              frame_pic[facing]);
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
          }
        }
      }

      const { centerx, centery } = frame;
      const offset_x =
        entity.facing === 1 ? centerx : entity_mesh.scale_x - centerx;
      entity_mesh.set_position(
        Math.round(x - offset_x),
        Math.round(y - z / 2 + centery),
        Math.round(z),
      );

      const is_visible = !entity.invisible;
      const is_blinking = !!entity.blinking;
      entity_mesh.visible = is_visible;

      shadow.mesh.set_position(
        Math.round(x),
        Math.round(-z / 2),
        Math.round(z - 550),
      );
      shadow.visible = is_visible && !frame.no_shadow;
      this._info_sprite.visible = is_visible;

      if (is_blinking && is_visible) {
        entity_mesh.visible = 0 === Math.floor(entity.blinking / 4) % 2;
      }

      this._info_sprite.update_position();
      entity.holding?.follow_holder();
    }

    if (entity.shaking) {
      if (this._shaking !== entity.shaking) {
        const x = entity.shaking % 2 ? -4 : 4;
        entity_mesh.x += facing * x;
      }
    }
    this._shaking = entity.shaking;
  }
  dispose(): void {
    this.indicators.depose();
    this.entity_mesh.dispose();
    if (this.pictures)
      for (const [, pic] of this.pictures) pic.texture.dispose();
  }
}
