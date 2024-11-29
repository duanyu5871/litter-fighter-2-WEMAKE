import * as THREE from "three";
import { IMeshNode } from "../3d";
import { IFrameInfo, ITexturePieceInfo, TFace } from "../defines";
import IPicture from "../defines/IPicture";
import Ditto from "../ditto";
import create_pictures from "../loader/create_pictures";
import Entity from "./Entity";
import Shadow from "./Shadow";
export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: 0, x: 0, y: 0, w: 0, h: 0,
  ph: 0, pw: 0,
}
export class EntityRender {
  pictures?: Map<string, IPicture<THREE.Texture>>;
  entity?: Entity;
  entity_mesh?: IMeshNode;
  entity_material?: THREE.MeshBasicMaterial;
  piece: ITexturePieceInfo = EMPTY_PIECE;
  shadow?: Shadow;

  set_entity(entity: Entity): EntityRender {
    const { world, lf2, data } = this.entity = entity
    this.pictures = create_pictures(lf2, entity.data);
    const first_text = this.pictures.get('0')?.texture;
    const inner = this.entity_mesh = new Ditto.MeshNode(
      world.lf2, {
      geometry: new THREE.PlaneGeometry(1, 1).translate(0.5, -0.5, 0),
      material: this.entity_material = new THREE.MeshBasicMaterial({
        map: first_text,
        transparent: true,
      })
    });
    if (first_text) first_text.onUpdate = () => inner.update_all_material()
    this.entity_mesh.user_data.owner = this;
    this.entity_mesh.visible = false;
    this.entity_mesh.name = "Entity:" + data.id;
    this.shadow = new Shadow(entity, this.entity_mesh)
    return this;
  }

  protected _blinking_count = 0;
  protected _shaking_count: number = 0;
  private _previous = {
    face: (void 0) as TFace | undefined,
    frame: (void 0) as IFrameInfo | undefined,
  }
  update() {
    const { entity, entity_mesh: inner, entity_material: material, pictures, shadow } = this;
    if (!entity || !inner || !material || !pictures) return;
    const { world, lf2 } = entity;
    const { frame, position: { x, y, z }, facing } = entity;
    const { centerx, centery } = frame
    const offset_x = entity.facing === 1 ? centerx : inner.scale_x - centerx
    inner.set_position(x - offset_x, y - z / 2 + centery, z);
    inner.visible = !entity.invisible;
    
    if (shadow) {
      shadow.mesh.set_position(x, - z / 2, z - 550);
      shadow.visible = !frame.no_shadow && !entity.invisible;
    }

    if (entity.blinking) {
      ++this._blinking_count;
      inner.visible = 0 === Math.floor(this._blinking_count / 6) % 2;
    } else {
      this._blinking_count = 0;
    }

    if (
      this._previous.face === facing &&
      this._previous.frame === frame
    ) {
      return;
    }
    this._previous.face = facing;
    this._previous.frame = frame;
    const piece = frame.pic;
    if (typeof piece === 'number' || !('1' in piece)) {
      return;
    }
    if (this.piece !== piece[facing]) {
      const { x, y, w, h, tex, pw, ph } = this.piece = piece[facing];
      const pic = pictures.get('' + tex);
      if (pic) {
        pic.texture.offset.set(x, y);
        pic.texture.repeat.set(w, h);
        if (pic.texture !== material.map) {
          material.map = pic.texture;
        }
        inner.update_all_material()
      }
      inner.set_scale(pw, ph, 0)
    }

    world.restrict(entity);

    entity.info_sprite.update_position();



    entity.holding?.follow_holder();

    if (entity.shaking) {
      const x = (this._shaking_count % 2 ? -5 : 5);
      ++this._shaking_count;
      inner.x += x;
    } else {
      this._shaking_count = 0;
    }
  }
  dispose(): void {
    if (this.entity_mesh) this.entity_mesh.dispose()
    if (this.pictures)
      for (const [, pic] of this.pictures)
        pic.texture.dispose();
  }
}
