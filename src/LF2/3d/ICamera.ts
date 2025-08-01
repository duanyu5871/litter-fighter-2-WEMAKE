import type { IQuaternion, IRaycaster, IVector2, IVector3 } from "../defines";
import type { IObjectNode } from "./IObject";

export interface ICamera extends IObjectNode {
  readonly is_camera_node: true;
  world_quaternion(q: IQuaternion): this;
  raycaster(raycaster: IRaycaster, coords: IVector2): this;
  project(vec3: IVector3): IVector3;
}
export const is_camera_node = (v: any): v is ICamera =>
  v?.is_camera_node === true;