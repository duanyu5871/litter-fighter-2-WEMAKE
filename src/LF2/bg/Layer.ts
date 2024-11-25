import * as THREE from 'three';
import fade_out from '../../Utils/fade_out';
import { IMeshNode } from '../3d/IMeshNode';
import { IBgLayerInfo } from "../defines/IBgLayerInfo";
import { Defines } from '../defines/defines';
import Ditto from '../ditto';
import { TPicture } from '../loader/loader';
import Background, { ILayerUserData } from './Background';

export default class Layer {
  readonly mesh: IMeshNode;
  readonly bg: Background;

  private _show_indicators = false;
  get show_indicators() { return this._show_indicators; }
  set show_indicators(v: boolean) { this._show_indicators = v; }
  get user_data() { return this.mesh.user_data as ILayerUserData; }

  constructor(bg: Background, info: IBgLayerInfo, x: number, y: number, z: number, pic?: TPicture) {
    this.bg = bg;
    const w = pic ? pic.w : info.width;
    const h = pic ? pic.h : info.height;
    const params: THREE.MeshBasicMaterialParameters = { transparent: true, opacity: 0 }
    if (pic?.texture) params.map = pic.texture;
    else params.color = info.color

    this.mesh = new Ditto.MeshNode(bg.world.lf2, {
      geometry: new THREE.PlaneGeometry(w, h).translate(w / 2, -h / 2, 0),
      material: new THREE.MeshBasicMaterial(params)
    })
    this.mesh.name = "bg layer: " + Layer.name
    this.mesh.set_position(x, y, z);

    (this.mesh.user_data as ILayerUserData) = { x, y, z, info, w, h, owner: this };
  }

  update(count: number) {
    this.mesh.tran_opacity(0.1)
    const { w: inner_w, h: inner_h, info: { width, c1, c2, cc, absolute }, x } = this.user_data;
    if (cc !== void 0 && c1 !== void 0 && c2 !== void 0) {
      const now = count % cc;
      this.mesh.visible = now >= c1 && now <= c2;
    }
    if (!inner_w || !inner_h) return;
    const bg_width = this.bg.width;
    if (bg_width <= Defines.OLD_SCREEN_WIDTH) return;
    const cam_x = this.bg.world.camera.x;
    if (absolute)
      this.mesh.set_x(x + cam_x)
    else
      this.mesh.set_x(x + (bg_width - width) * cam_x / (bg_width - Defines.OLD_SCREEN_WIDTH));
  }

  fade_out(duration: number, delay: number = 0): void {
    fade_out(o => this.mesh.set_opacity(o), duration, delay)
  }
}