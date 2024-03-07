import * as THREE from 'three';
import { IBgData } from '../js_utils/lf2_type';
import { IBgLayerInfo } from "../js_utils/lf2_type/IBgLayerInfo";
import { Defines } from '../js_utils/lf2_type/defines';
import { World } from './World';
import { texture_loader } from './loader/loader';

interface ILayerUserData {
  x: number;
  y: number;
  z: number;
  info: IBgLayerInfo;
  inner_w?: number;
  inner_h?: number;
  owner: BgLayer;
}
export class BgLayer {
  private _obj_3d: THREE.Object3D;
  get obj_3d() { return this._obj_3d; }

  private _show_indicators = false
  get show_indicators() { return this._show_indicators; }
  set show_indicators(v: boolean) { this._show_indicators = v; }

  constructor(info: IBgLayerInfo, x: number, y: number, z: number, texture?: THREE.Texture) {
    const geo = new THREE.PlaneGeometry(1, 1).translate(0.5, -0.5, 0);
    const material = new THREE.MeshBasicMaterial(
      texture ? { map: texture, transparent: true } : { color: info.color }
    );
    const layer = this._obj_3d = new THREE.Mesh(geo, material);
    const { width, height } = texture ? texture.image : info;
    layer.scale.set(width, height, 1);
    layer.position.set(x, y, z);
    const user_data: ILayerUserData = {
      x, y, z,
      info,
      inner_w: width,
      inner_h: height,
      owner: this
    }
    layer.userData = user_data;
  }
}

export class Background {
  readonly data: IBgData;
  private _disposers: (() => void)[] = [];
  private _obj_3d: THREE.Object3D;
  private _world: World;
  private _layers: BgLayer[] = [];
  get left() { return this.data.base.left; }
  get right() { return this.data.base.right; }
  get near() { return this.data.base.near; }
  get far() { return this.data.base.far; }
  get width() { return this.right - this.left; }
  get depth() { return this.near - this.far; };
  get middle() {
    return {
      x: (this.right + this.left) / 2,
      z: (this.far + this.near) / 2,
    }
  }
  constructor(world: World, data: IBgData) {
    this.data = data;
    this._world = world;

    const node = this._obj_3d = new THREE.Object3D();
    this._obj_3d.position.z = -2 * Defines.OLD_SCREEN_HEIGHT;

    for (const info of data.layers) {
      if ('color' in info) this.add_layer(info);
      let path: any;
      if (!info.file) continue;
      if (!path) try { path = require('./' + info.file.replace(/.bmp$/g, '.png')); } catch (e) { }
      if (!path) try { path = require('./' + info.file + '.png'); } catch (e) { }
      if (!path) try { path = require('./' + info.file); } catch (e) { }
      if (!path) { continue; }
      this.get_texture(path).then(t => this.add_layer(info, t))
    }
    this._disposers.push(
      () => world.scene.remove(node)
    );
    world.scene.add(node);
  }

  private add_layer(info: IBgLayerInfo, texture?: THREE.Texture) {
    let { x, y, z, loop = 0 } = info;
    do {
      const layer = new BgLayer(info, x, y, z, texture)
      this._obj_3d.add(layer.obj_3d);
      this._layers.push(layer)
      x += loop;
    } while (loop > 0 && x < this.width);
  }

  private get_texture(p: any) {
    return new Promise<THREE.Texture>((resolve, reject) => {
      const texture = texture_loader.load(p, resolve, void 0, reject);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.magFilter = THREE.NearestFilter;
      texture.colorSpace = THREE.SRGBColorSpace;
    })
  }

  dispose() {
    this._disposers.forEach(f => f());
  }

  private _q = new THREE.Quaternion()
  private _update_times = 0;
  update() {
    this._update_times++;
    const { camera } = this._world;
    for (const child of this._obj_3d.children) {
      const user_data = child.userData as ILayerUserData;
      const { inner_w: img_w, inner_h: img_h, info: { width, c1, c2, cc, absolute }, x } = user_data;
      if (cc !== void 0 && c1 !== void 0 && c2 !== void 0) {
        const now = this._update_times % cc;
        child.visible = now >= c1 && now <= c2;
      }
      if (!img_w || !img_h) continue;
      const bg_width = this.data.base.right - this.data.base.left;
      if (bg_width <= Defines.OLD_SCREEN_WIDTH) continue;

      if (absolute)
        child.position.x = x + camera.position.x;
      else
        child.position.x = x + (bg_width - width) * camera.position.x / (bg_width - Defines.OLD_SCREEN_WIDTH);

    }
    camera.getWorldQuaternion(this._q)
    this._obj_3d.rotation.setFromQuaternion(this._q);
  }
}