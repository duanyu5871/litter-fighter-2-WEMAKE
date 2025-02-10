import { IOrthographicCameraNode } from "../../LF2/3d/IOrthographicCamera";
import { IQuaternion, IRaycaster } from "../../LF2/defines";
import LF2 from "../../LF2/LF2";
import { __Object } from "./__Object";
import * as _T from "./_t";

export class __Camera_O extends __Object implements IOrthographicCameraNode {
  readonly is_orthographic_camera_node = true;
  get left(): number {
    return this.inner.left;
  }
  set left(v: number) {
    this.inner.left = v;
  }
  get right(): number {
    return this.inner.right;
  }
  set right(v: number) {
    this.inner.right = v;
  }
  get top(): number {
    return this.inner.top;
  }
  set top(v: number) {
    this.inner.top = v;
  }
  get bottom(): number {
    return this.inner.bottom;
  }
  set bottom(v: number) {
    this.inner.bottom = v;
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

  override get inner(): _T.OrthographicCamera {
    return this._inner as _T.OrthographicCamera;
  }
  constructor(lf2: LF2) {
    super(lf2);
    this._inner = new _T.OrthographicCamera();
  }
  override apply(): this {
    super.apply();
    this.inner.updateProjectionMatrix();
    return this;
  }
  setup(
    l: number,
    r: number,
    t: number,
    b: number,
    n: number = 0.1,
    f: number = 2000,
  ): this {
    const { inner } = this;
    inner.left = l;
    inner.right = r;
    inner.bottom = b;
    inner.top = t;
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
