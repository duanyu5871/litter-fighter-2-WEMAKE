import { BufferGeometry, Material, MeshBasicMaterial } from "three";
import { IObjectNode } from "./IObjectNode";
export { BufferGeometry, Material, MeshBasicMaterial } from "three";
export interface IMeshInfo {
  geometry?: BufferGeometry;
  material?: MeshBasicMaterial;
}
export interface IMeshNode extends IObjectNode {
  set geometry(v: BufferGeometry);
  get geometry(): BufferGeometry;
  readonly is_mesh_node: true;

  set_info(info: IMeshInfo): this;
  get_info(): IMeshInfo;

  get material(): Material | Material[];
  set material(v: Material | Material[]);
  tran_opacity(arg0: number): this;
  set_opacity(arg0: number): this;
  update_all_material(): this;
  set_depth_test(v: boolean): this;
  set_depth_write(v: boolean): this;

  get render_order(): number;
  set render_order(v: number);
}
export const is_mesh_node = (v: any): v is IMeshNode =>
  v?.is_mesh_node === true;
