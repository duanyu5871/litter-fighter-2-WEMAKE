import type LF2 from "../LF2";
import { IBaseNode } from "./IBaseNode";
import * as THREE from 'three'

export interface IObjectNode extends IBaseNode {
  readonly is_object_node: true;
  readonly lf2: LF2;

  get x(): number;
  set x(v: number);

  get y(): number;
  set y(v: number);

  get z(): number;
  set z(v: number);

  get visible(): boolean;
  set visible(v: boolean);

  get opacity(): number;
  set opacity(v: number);

  get w(): number;
  get h(): number;

  get size(): [number, number];
  set size([w, h]: [number, number]);

  get user_data(): Record<string, any>;

  get rgb(): [number, number, number];
  set rgb([r, g, b]: [number, number, number]);

  unset_size(): this;

  set_opacity(v: number): this;

  set_visible(v: boolean): this;

  set_name(v: string): this;

  set_x(x: number): this;

  set_y(y: number): this;

  set_z(z: number): this;

  set_pos(x?: number, y?: number, z?: number): this;

  set_scale(x?: number, y?: number, z?: number): this;

  set_size(w?: number, h?: number): this;

  set_center(x?: number, y?: number, z?: number): this;

  apply(): this;

  set_rgb(r: number, g: number, b: number): this;

  set_position(x: number, y: number, z: number): this;

  rotation_from_quaternion(q: THREE.Quaternion): this;

  intersects_from_raycaster(raycaster: THREE.Raycaster, recursive?: boolean): THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]
  intersect_from_raycaster(raycaster: THREE.Raycaster, recursive?: boolean): THREE.Intersection<THREE.Object3D<THREE.Object3DEventMap>>[]
}
export const is_object_node = (v: any): v is IObjectNode =>
  v?.is_object_node === true