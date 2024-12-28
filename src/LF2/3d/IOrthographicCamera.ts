import { IVector2 } from "../ditto/IVector2";
import { IObjectNode } from "./IObjectNode";

export interface IOrthographicCameraNode extends IObjectNode {
  readonly is_orthographic_camera_node: true;
  get left(): number;
  set left(v: number);
  get right(): number;
  set right(v: number);
  get top(): number;
  set top(v: number);
  get bottom(): number;
  set bottom(v: number);
  get far(): number;
  set far(v: number);
  get near(): number;
  set near(v: number);
  setup(
    l: number,
    r: number,
    t: number,
    b: number,
    n?: number,
    f?: number,
  ): this;
  world_quaternion(q: THREE.Quaternion): this;
  raycaster(raycaster: THREE.Raycaster, coords: IVector2): this;
}
export const is_orthographic_camera_node = (
  v: any,
): v is IOrthographicCameraNode => v?.is_orthographic_camera_node === true;
