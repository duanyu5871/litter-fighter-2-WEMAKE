import * as THREE from 'three';
import { IBgLayerInfo } from "../js_utils/lf2_type/IBgLayerInfo";
import { Defines } from '../js_utils/lf2_type/defines';
import { Background, ILayerUserData } from './Background';
import fade_out from '../Utils/fade_out';

export class BgLayer {
  readonly obj_3d: THREE.Mesh;
  readonly bg: Background;
  readonly user_data: Readonly<ILayerUserData>;
  readonly material: THREE.MeshBasicMaterial;

  private _show_indicators = false;
  get show_indicators() { return this._show_indicators; }
  set show_indicators(v: boolean) { this._show_indicators = v; }

  constructor(bg: Background, info: IBgLayerInfo, x: number, y: number, z: number, texture?: THREE.Texture) {
    const { width: w, height: h } = texture ? texture.image : info;
    const geo = new THREE.PlaneGeometry(w, h).translate(w / 2, -h / 2, 0);
    const params: THREE.MeshBasicMaterialParameters = { transparent: true, opacity: 0 }
    if (texture) params.map = texture;
    else params.color = info.color

    this.material = new THREE.MeshBasicMaterial(params);
    const layer = this.obj_3d = new THREE.Mesh(geo, this.material);
    layer.position.set(x, y, z);
    this.bg = bg
    this.user_data = {
      x, y, z,
      info,
      w,
      h,
      owner: this
    };
    layer.userData = this.user_data;
  }

  update(count: number) {
    this.material.opacity += 0.1
    const { w: inner_w, h: inner_h, info: { width, c1, c2, cc, absolute }, x, z } = this.user_data;
    if (cc !== void 0 && c1 !== void 0 && c2 !== void 0) {
      const now = count % cc;
      this.obj_3d.visible = now >= c1 && now <= c2;
    }
    if (!inner_w || !inner_h) return;
    const bg_width = this.bg.width;
    if (bg_width <= Defines.OLD_SCREEN_WIDTH) return;
    const cam_x = this.bg.world.camera.position.x;
    if (absolute)
      this.obj_3d.position.x = x + cam_x;
    else
      this.obj_3d.position.x = x + (bg_width - width) * cam_x / (bg_width - Defines.OLD_SCREEN_WIDTH);
  }

  fade_out(duration: number, delay: number = 0): void {
    fade_out(o => this.material.opacity = o, duration, delay)
  }
}