import type { IQuaternion, IRaycaster } from "../defines";
import type LF2 from "../LF2";
import type { IBaseNode } from "./IBaseNode";
export type ObjectEventKey = "added" | "removed";
export interface IObjectNode extends IBaseNode {
  readonly is_object_node: true;
  readonly lf2: LF2;

  x: number;
  y: number;
  z: number;

  visible: boolean;

  opacity: number;

  get w(): number;
  get h(): number;

  size: [number, number];
  user_data: Record<string, any>;
  rgb: [number, number, number];

  scale_x: number;
  scale_y: number;
  scale_z: number;

  unset_size(): this;

  set_opacity(v: number): this;

  set_visible(v: boolean): this;

  set_name(v: string): this;

  set_x(x: number): this;

  set_y(y: number): this;

  set_z(z: number): this;

  set_position(x?: number, y?: number, z?: number): this;

  set_scale(x?: number, y?: number, z?: number): this;
  set_scale_x(v: number): this;
  set_scale_y(v: number): this;
  set_scale_z(v: number): this;

  set_size(w?: number, h?: number): this;

  set_center(x?: number, y?: number, z?: number): this;

  apply(): this;

  set_rgb(r: number, g: number, b: number): this;
  rotation_from_quaternion(q: IQuaternion): this;
  intersect_from_raycaster(
    raycaster: IRaycaster,
    recursive?: boolean,
  ): IIntersection[];
  on(key: ObjectEventKey, fn: () => void): this;
  off(key: ObjectEventKey, fn: () => void): this;
}
export interface IIntersection {
  object: IObjectNode;
}
export const is_object_node = (v: any): v is IObjectNode =>
  v?.is_object_node === true;
