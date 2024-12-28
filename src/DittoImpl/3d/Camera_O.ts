import * as THREE from "three";
import LF2 from "../../LF2/LF2";
import { __ObjectNode } from "./ObjectNode";
import { IOrthographicCameraNode } from "../../LF2/3d/IOrthographicCamera";

export class __Camera_O_Node
  extends __ObjectNode
  implements IOrthographicCameraNode
{
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

  override get inner(): THREE.OrthographicCamera {
    return this._inner as THREE.OrthographicCamera;
  }
  constructor(lf2: LF2) {
    super(lf2);
    this._inner = new THREE.OrthographicCamera();
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
  world_quaternion(q: THREE.Quaternion): this {
    this.inner.getWorldQuaternion(q);
    return this;
  }
  raycaster(r: THREE.Raycaster, coords: THREE.Vector2): this {
    r.setFromCamera(coords, this.inner);
    return this;
  }
}
