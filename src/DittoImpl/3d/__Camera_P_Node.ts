import * as THREE from "three";
import { IPerspectiveCamera } from "../../LF2/3d/IPerspectiveCamera";
import LF2 from "../../LF2/LF2";
import { __ObjectNode } from "./ObjectNode";

export class __Camera_P_Node
  extends __ObjectNode
  implements IPerspectiveCamera
{
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

  override get inner(): THREE.PerspectiveCamera {
    return this._inner as THREE.PerspectiveCamera;
  }
  constructor(lf2: LF2) {
    super(lf2);
    this._inner = new THREE.PerspectiveCamera();
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
  world_quaternion(q: THREE.Quaternion): this {
    this.inner.getWorldQuaternion(q);
    return this;
  }
  raycaster(r: THREE.Raycaster, coords: THREE.Vector2): this {
    r.setFromCamera(coords, this.inner);
    return this;
  }
}
