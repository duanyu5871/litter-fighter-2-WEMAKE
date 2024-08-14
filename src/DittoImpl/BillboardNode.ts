import { BufferGeometry, NormalBufferAttributes, Sprite, SpriteMaterial } from "three";
import { IBillboardInfo, IBillboardNode } from "../LF2/3d";
import LF2 from "../LF2/LF2";
import { __ObjectNode } from "./3d";

export class __BillboardNode extends __ObjectNode implements IBillboardNode {
  readonly is_billboard_node = true;
  readonly is_mesh_node = true;
  constructor(lf2: LF2, info?: IBillboardInfo) {
    super(lf2, new Sprite(info?.material))
  }
  get inner() { return this._inner as Sprite }
  set geometry(v: BufferGeometry<NormalBufferAttributes>) {
    throw new Error("Method not implemented.");
  }
  get geometry(): BufferGeometry<NormalBufferAttributes> {
    throw new Error("Method not implemented.");
  }
  get material(): SpriteMaterial { return this.inner.material }
  get renderOrder(): number { return this.inner.renderOrder }
  set renderOrder(v: number) { this.inner.renderOrder = v }
}