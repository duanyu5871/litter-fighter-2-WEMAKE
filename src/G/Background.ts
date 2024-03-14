import * as THREE from 'three';
import { IBgData } from '../js_utils/lf2_type';
import { IBgLayerInfo } from "../js_utils/lf2_type/IBgLayerInfo";
import { Defines } from '../js_utils/lf2_type/defines';
import { BgLayer } from './BgLayer';
import { World } from './World';
import { TDataPromise, TPictureInfo, create_picture, error_picture_info, image_pool, make_data_promise_reject } from './loader/loader';

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
      if (!info.file) continue;
      const path = this.get_path(info.file);
      if (!path) continue;
      jobs.push(this.get_texture(info.file, path).then(t => this.add_layer(info, t)))
    }
    this._disposers.push(
      () => world.scene.remove(node)
    );
    world.scene.add(node);
  }

  private get_path(file: string): string | undefined {
    let path: string | undefined;
    if (!path) try { path = require('./' + file.replace(/.bmp$/g, '.png')); } catch (e) { }
    if (!path) try { path = require('./' + file + '.png'); } catch (e) { }
    if (!path) try { path = require('./' + file); } catch (e) { }
    return path
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

  private async get_texture(key: string, path: string): Promise<THREE.Texture> {
    const img_info = await image_pool.load(key, path);
    const pic_info = await create_picture(key, img_info);
    return pic_info.texture;
  }

  async get_shadow(): Promise<TPictureInfo> {
    const key = this.data.base.shadow;
    if (!key) return error_picture_info(key)
    const path = this.get_path(key);
    if (!path) return error_picture_info(key)
    return image_pool.load(key, path).then(v => create_picture(key, v))
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