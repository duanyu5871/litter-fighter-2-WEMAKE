import { IMeshNode } from "../3d";
import { Defines } from "../defines";
import Ditto from "../ditto";
import { TPicture } from "../loader/loader";
import Layer from "../bg/Layer";
import * as THREE from "three";

export class BgLayerRender {
  readonly mesh: IMeshNode;
  readonly layer: Layer;
  readonly pic: TPicture | undefined;
  private _show_indicators = false;
  get show_indicators() { return this._show_indicators; }
  set show_indicators(v: boolean) { this._show_indicators = v; }
  constructor(layer: Layer) {
    this.layer = layer;
    const { bg, info } = layer;
    const { x, y, z } = info;
    if (info.file) this.pic = bg.world.lf2.images.create_pic_by_img_key(info.file);
    const { pic } = this;
    const w = pic?.w ?? info.width;
    const h = pic?.h ?? info.height;
    const params: THREE.MeshBasicMaterialParameters = {
      transparent: true,
      opacity: 0,
    };
    if (pic?.texture) params.map = pic.texture;
    else params.color = info.color;
    this.mesh = new Ditto.MeshNode(bg.world.lf2, {
      geometry: new THREE.PlaneGeometry(w, h).translate(w / 2, -h / 2, 0),
      material: new THREE.MeshBasicMaterial(params),
    });
    this.mesh.name = "bg layer: " + Layer.name;
    this.mesh.set_position(x, y, z);
  }

  render() {
    const { opacity, visible, info: { x, absolute, width }, bg } = this.layer;
    this.mesh.set_opacity(opacity);
    this.mesh.visible = visible;
    const cam_x = bg.world.camera.x;
    if (absolute) this.mesh.set_x(x + cam_x);
    else
      this.mesh.set_x(
        x +
        ((bg.width - width) * cam_x) /
        (bg.width - Defines.CLASSIC_SCREEN_WIDTH),
      );
  }
}