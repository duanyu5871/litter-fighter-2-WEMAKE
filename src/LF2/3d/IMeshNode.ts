

import { BufferGeometry, Material, MeshBasicMaterial } from "three";
import { IObjectNode } from "./IObjectNode";
export { BufferGeometry, Material, MeshBasicMaterial } from "three";
export interface IMeshInfo {
  geometry?: BufferGeometry
  material?: MeshBasicMaterial
}
export interface IMeshNode extends IObjectNode {
  set geometry(v: BufferGeometry);
  get geometry(): BufferGeometry;
  readonly is_mesh_node: true;

  set_info(info: IMeshInfo): this;
  get_info(): IMeshInfo;

  get material(): Material | Material[];
  tran_materials_opacity(arg0: number): this;
  set_materials_opacity(arg0: number): this;
  update_all_material(): this;
  set_depth_test(v: boolean): this;
  set_depth_write(v: boolean): this;


  get renderOrder(): number;
  set renderOrder(v: number);
}
export const is_mesh_node = (v: any): v is IMeshNode =>
  v?.is_mesh_node === true