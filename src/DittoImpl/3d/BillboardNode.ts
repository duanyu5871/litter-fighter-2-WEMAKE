import { __ObjectNode } from ".";
import { IBillboardInfo, IBillboardNode } from "../../LF2/3d";
import LF2 from "../../LF2/LF2";
import { Sprite, SpriteMaterial } from "./_t";

export class __BillboardNode extends __ObjectNode implements IBillboardNode {
  readonly is_billboard_node = true;
  readonly is_mesh_node = true;
  constructor(lf2: LF2, info?: IBillboardInfo) {
    super(lf2, new Sprite(info?.material));
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
}
