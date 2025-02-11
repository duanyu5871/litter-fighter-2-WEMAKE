import type { IBillboardInfo, IBillboardNode } from "../../LF2/3d";
import { IPicture } from "../../LF2/defines";
import LF2 from "../../LF2/LF2";
import { __Object } from "./__Object";
import { Sprite, SpriteMaterial } from "./_t";

export class __Billboard extends __Object implements IBillboardNode {
  readonly is_billboard_node = true;
  readonly is_mesh_node = true;
  constructor(lf2: LF2, info?: IBillboardInfo) {
    const material = new SpriteMaterial(info)
    super(lf2, new Sprite(material));
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
  override set_visible(v: boolean): this {
    this.material.visible = false;
    return this;
  }
  set_texture(picutre: IPicture): this {
    this.inner.material.map?.dispose();
    this.inner.material.map = picutre.texture;
    return this;
  }
  clear_material(): this {
    this.inner.material.map?.dispose();
    this.inner.material.map = null;
    return this
  }
  update_material(): this {
    this.inner.material.needsUpdate = true;
    return this;
  }
}
