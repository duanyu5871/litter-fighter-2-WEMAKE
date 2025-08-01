import { ICamera } from "../../LF2/3d/ICamera";
import { IQuaternion, IRaycaster, IVector3 } from "../../LF2/defines";
import { __Object } from "./__Object";
import * as _T from "./_t";


export abstract class __Camera extends __Object implements ICamera {
  readonly is_camera_node = true;
  override get inner(): _T.Camera {
    return this._inner as _T.Camera;
  }
  world_quaternion(q: IQuaternion): this {
    this.inner.getWorldQuaternion(q as _T.Quaternion);
    return this;
  }
  raycaster(r: IRaycaster, coords: _T.Vector2): this {
    (r as _T.Raycaster).setFromCamera(coords, this.inner);
    return this;
  }
  project(vec3: IVector3): IVector3 {
    return new _T.Vector3(vec3.x, vec3.y, vec3.z).project(this.inner);
  }
}
