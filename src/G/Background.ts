import * as THREE from 'three';
import { IBgData } from '../js_utils/lf2_type';
import { IBgLayerInfo } from "../js_utils/lf2_type/IBgLayerInfo";
import { Defines } from '../js_utils/lf2_type/defines';
import { BgLayer } from './BgLayer';
import { World } from './World';
import { texture_loader } from './loader/loader';

export interface ILayerUserData {
  x: number;
  y: number;
  z: number;
  info: IBgLayerInfo;
  w: number;
  h: number;
  owner: BgLayer;
}
export class Background {
  readonly data: Readonly<IBgData>;
  private _disposers: (() => void)[] = [];
  private _layers: BgLayer[] = [];
  readonly id: string;
  readonly left: number
  readonly right: number
  readonly near: number
  readonly far: number
  readonly width: number
  readonly depth: number
  readonly middle: { x: number, z: number };
  readonly obj_3d: THREE.Object3D;
  readonly world: World;

  constructor(world: World, data: IBgData) {
    this.data = data;
    this.world = world;

    this.id = this.data.id;
    this.left = this.data.base.left;
    this.right = this.data.base.right;
    this.near = this.data.base.near;
    this.far = this.data.base.far;
    this.width = this.right - this.left;
    this.depth = this.near - this.far;
    this.middle = {
      x: (this.right + this.left) / 2,
      z: (this.far + this.near) / 2,
    }
    const node = this.obj_3d = new THREE.Object3D();
    this.obj_3d.position.z = -2 * Defines.OLD_SCREEN_HEIGHT;

    const jobs: Promise<any>[] = []
    for (const info of data.layers) {
      if ('color' in info) this.add_layer(info);
      let path: any;
      if (!info.file) continue;
      if (!path) try { path = require('./' + info.file.replace(/.bmp$/g, '.png')); } catch (e) { }
      if (!path) try { path = require('./' + info.file + '.png'); } catch (e) { }
      if (!path) try { path = require('./' + info.file); } catch (e) { }
      if (!path) { continue; }
      jobs.push(this.get_texture(path).then(t => this.add_layer(info, t)))
    }
    Promise.all(jobs).then(() => {
      // let min = 9999;
      // let max = 0;
      // for (const l of this._layers) {
      //   min = Math.min(min, l.user_data.y - l.user_data.h)
      //   max = Math.max(max, l.user_data.y)
      // }
      // for (const l of this._layers)
      //   l.obj_3d.position.y -= min;
    })
    this._disposers.push(
      () => world.scene.remove(node)
    );
    world.scene.add(node);
  }

  private add_layer(info: IBgLayerInfo, texture?: THREE.Texture) {
    let { x, y, z, loop = 0 } = info;
    do {
      const layer = new BgLayer(this, info, x, y, z, texture)
      this.obj_3d.add(layer.obj_3d);
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
  update() {
    for (const layer of this._layers) layer.update()
    this.world.camera.getWorldQuaternion(this._q);
    this.obj_3d.rotation.setFromQuaternion(this._q);
  }
}