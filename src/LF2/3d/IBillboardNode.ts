import { SpriteMaterial } from "three";
import { IObjectNode } from "./IObjectNode";
export { SpriteMaterial } from "three";
export interface IBillboardInfo {
  material: SpriteMaterial
}
export interface IBillboardNode extends IObjectNode {
  readonly is_billboard_node: true
  get material(): SpriteMaterial
  get renderOrder(): number;
  set renderOrder(v: number)
}
export const is_billboard_node = (v: any): v is IBillboardNode => v.is_billboard_node === true