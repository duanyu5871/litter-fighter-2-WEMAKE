import type { IBillboardInfo, IBillboardNode } from "../../LF2/3d";
import { IPicture } from "../../LF2/defines";
import { LF2 } from "../../LF2/LF2";
import { __Object } from "./__Object";
import { Sprite, SpriteMaterial } from "./_t";

export class __Billboard extends __Object implements IBillboardNode {
  readonly is_billboard_node = true;
  readonly is_mesh_node = true;
  protected _info: IBillboardInfo = {}
  constructor(lf2: LF2, info: IBillboardInfo = {}) {
    const material = new SpriteMaterial(info)
    super(lf2, new Sprite(material));
    this._info = info;
  }
  override get inner() {
    return this._inner as Sprite;
  }
  get material(): SpriteMaterial {
    return this.inner.material;
  }
  get render_order(): number {
    return this.inner.renderOrder;
  }
  set render_order(v: number) {
    this.inner.renderOrder = v;
  }
  set_texture(picutre: IPicture): this {
    this.inner.material.map?.dispose();
    this.inner.material.dispose();
    this.inner.material = new SpriteMaterial({ ...this._info, map: picutre.texture })
    this.inner.material.needsUpdate = true;
    this.inner.scale.set(picutre.w, picutre.h, 0);
    return this;
  }
  clear_material(): this {
    this.inner.material.map?.dispose();
    this.inner.material.map = null;
    this.inner.material.needsUpdate = true
    return this
  }
  update_material(): this {
    this.inner.material.needsUpdate = true;
    return this;
  }
}
