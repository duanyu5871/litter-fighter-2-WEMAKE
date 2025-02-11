import IPicture from "../defines/IPicture";
import { IObjectNode } from "./IObjectNode";
export interface IBillboardInfo {
  visible?: boolean;
}
export interface IBillboardNode extends IObjectNode {
  readonly is_billboard_node: true;
  get render_order(): number;
  set render_order(v: number);
  set_texture(picutre: IPicture): this;
  clear_material(): this;
  update_material(): this;
}
export const is_billboard_node = (v: any): v is IBillboardNode =>
  v.is_billboard_node === true;
