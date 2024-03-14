import * as THREE from 'three';
import { IBgLayerInfo } from "../js_utils/lf2_type/IBgLayerInfo";
import { ILayerUserData } from './Background';

export class BgLayer {
  private _obj_3d: THREE.Object3D;
  get obj_3d() { return this._obj_3d; }

  private _show_indicators = false;
  get show_indicators() { return this._show_indicators; }
  set show_indicators(v: boolean) { this._show_indicators = v; }

  private _user_data: Readonly<ILayerUserData>;
  get user_data() { return this._user_data }
  constructor(info: IBgLayerInfo, x: number, y: number, z: number, texture?: THREE.Texture) {
    const { width: w, height: h } = texture ? texture.image : info;
    const geo = new THREE.PlaneGeometry(w, h).translate(w / 2, -h / 2, 0);
    const material = new THREE.MeshBasicMaterial(
      texture ? { map: texture, transparent: true } : { color: info.color }
    );
    const layer = this._obj_3d = new THREE.Mesh(geo, material);
    layer.position.set(x, y, z);
    this._user_data = {
      x, y, z,
      info,
      w,
      h,
      owner: this
    };
    layer.userData = this._user_data;
  }
}
