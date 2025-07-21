import * as THREE from "../3d/_t";
import type { IMeshNode } from "../../LF2/3d";
import type Layer from "../../LF2/bg/Layer";
import Ditto from "../../LF2/ditto";
import type { TPicture } from "../../LF2/loader/loader";
import type { IBgLayerRender } from "../../LF2/ditto/render/IBgLayerRender";

const pic_map = new Map<string, TPicture>()

export class BgLayerRender implements IBgLayerRender {
  readonly mesh: IMeshNode;
  readonly layer: Layer;
  readonly pic: TPicture | undefined;
  private _show_indicators = false;
  get show_indicators() { return this._show_indicators; }
  set show_indicators(v: boolean) { this._show_indicators = v; }

  get_pic = (file: string) => {
    let ret = pic_map.get(file);
    if (!ret) pic_map.set(file, ret = this.layer.bg.world.lf2.images.create_pic_by_img_key(file));
    return ret;
  }
  constructor(layer: Layer) {
    this.layer = layer;
    const { bg, info } = layer;
    const { x, y, z, file } = info;
    if (file)
      this.pic = this.get_pic(file);
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
    this.mesh.name = "bg layer";
    this.mesh.set_position(x, y, z);
  }

  update() {
    const { opacity, visible, info: { x, absolute, width }, bg } = this.layer;
    this.mesh.set_opacity(opacity);
    this.mesh.visible = visible;
    const cam_x = bg.world.renderer.cam_x;
    const _x = absolute ?
      x + cam_x :
      bg.width > bg.world.screen_w ?
        x + (bg.width - width) * cam_x / (bg.width - bg.world.screen_w) :
        x + (bg.width - width) * cam_x

    this.mesh.set_x(_x);
  }

  release(): void {

  }
}