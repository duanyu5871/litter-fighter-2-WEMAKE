import * as _T from "./_t";
import { IPerspectiveCamera } from "../../LF2/3d/IPerspectiveCamera";
import LF2 from "../../LF2/LF2";
import { __ObjectNode } from "./ObjectNode";
import { IQuaternion } from "../../LF2/defines/IQuaternion";
import { IRaycaster } from "../../LF2/3d/IRaycaster";

export class __Camera_P_Node
  extends __ObjectNode
  implements IPerspectiveCamera {
  readonly is_perspective_camera_node = true;
  get aspect(): number {
    return this.inner.aspect;
  }
  set aspect(v: number) {
    this.inner.aspect = v;
  }
  get far(): number {
    return this.inner.far;
  }
  set far(v: number) {
    this.inner.far = v;
  }
  get near(): number {
    return this.inner.near;
  }
  set near(v: number) {
    this.inner.near = v;
  }

  override get inner(): _T.PerspectiveCamera {
    return this._inner as _T.PerspectiveCamera;
  }
  constructor(lf2: LF2) {
    super(lf2);
    this._inner = new _T.PerspectiveCamera();
  }
  override apply(): this {
    super.apply();
    this.inner.updateProjectionMatrix();
    return this;
  }
  setup(aspect: number, n: number = 0.1, f: number = 2000): this {
    const { inner } = this;
    inner.aspect = aspect;
    inner.near = n;
    inner.far = f;
    return this;
  }
  world_quaternion(q: IQuaternion): this {
    this.inner.getWorldQuaternion(q as _T.Quaternion);
    return this;
  }
  raycaster(r: IRaycaster, coords: _T.Vector2): this {
    (r as _T.Raycaster).setFromCamera(coords, this.inner);
    return this;
  }
}
