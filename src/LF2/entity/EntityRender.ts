import * as THREE from "three";
import { IMeshNode } from "../3d";
import IPicture from "../defines/IPicture";
import Ditto from "../ditto";
import create_pictures from "../loader/create_pictures";
import Entity from "./Entity";
import { IFrameInfo, ITexturePieceInfo, TFace } from "../defines";
export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: 0, x: 0, y: 0, w: 0, h: 0,
  ph: 0, pw: 0,
}
class EntityRender {
  pictures?: Map<string, IPicture<THREE.Texture>>;
  inner?: IMeshNode;
  material?: THREE.MeshBasicMaterial;
  entity?: Entity;
  _piece: ITexturePieceInfo = EMPTY_PIECE;
  set_entity(entity: Entity) {
    const { world, lf2, data } = this.entity = entity
    this.pictures = create_pictures(lf2, entity.data);
    const first_text = this.pictures.get('0')?.texture;
    const inner = this.inner = new Ditto.MeshNode(
      world.lf2, {
      geometry: new THREE.PlaneGeometry(1, 1).translate(0.5, -0.5, 0),
      material: this.material = new THREE.MeshBasicMaterial({
        map: first_text,
        transparent: true,
      })
    });
    if (first_text) first_text.onUpdate = () => inner.update_all_material()
    this.inner.user_data.owner = this;
    this.inner.visible = false;
    this.inner.name = "Entity:" + data.id
  }


  blinking_count = 0;
  _shaking: number = 0;

  private _previous = {
    face: (void 0) as TFace | undefined,
    frame: (void 0) as IFrameInfo | undefined,
  }
  update() {
    const { entity, inner, material, pictures } = this;
    if (!entity || !inner || !material || !pictures) return;
    const { world, lf2 } = entity;
    const { frame, position: { x, y, z }, facing } = entity;
    const { centerx, centery } = frame
    const offset_x = entity.facing === 1 ? centerx : inner.scale_x - centerx
    inner.set_position(x - offset_x, y - z / 2 + centery, z);

    if (entity.invisible) {
      inner.visible = entity.invisible;
    } else if (entity.blinking) {
      ++this.blinking_count;
      inner.visible = 0 === Math.floor(this.blinking_count / 6) % 2;
    } else {
      this.blinking_count = 0;
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
    if (this._piece !== piece[facing]) {
      const { x, y, w, h, tex, pw, ph } = this._piece = piece[facing];
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

    inner.set_position(x - offset_x, y - z / 2 + centery, z);

    entity.info_sprite.update_position();
    entity.shadow.mesh.set_position(x, - z / 2, z - 550);
    entity.holding?.follow_holder();

    if (this._shaking) {
      const x = (this._shaking % 2 ? -5 : 5);
      inner.x += x;
    }
  }
  dispose(): void {
    if (this.inner) this.inner.dispose()
    if (this.pictures)
      for (const [, pic] of this.pictures)
        pic.texture.dispose();
  }
}
