import * as THREE from 'three';
import { IBgData } from '../../common/lf2_type';
import { IBgLayerInfo } from "../../common/lf2_type/IBgLayerInfo";
import { Defines } from '../../common/lf2_type/defines';
import Layer from './Layer';
import { World } from '../World';
import { TPictureInfo, create_picture, error_picture_info } from '../loader/loader';

export interface ILayerUserData {
  x: number;
  y: number;
  z: number;
  info: IBgLayerInfo;
  w: number;
  h: number;
  owner: Layer;
}
export default class Background {
  readonly data: Readonly<IBgData>;
  private _disposers: (() => void)[] = [];
  private _layers: Layer[] = [];
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
    this.obj_3d = new THREE.Object3D();
    this.obj_3d.position.z = -2 * Defines.OLD_SCREEN_HEIGHT;
    this.obj_3d.name = Background.name + ':' + this.data.base.name;
    const jobs: Promise<any>[] = []

    for (const info of data.layers) {
      if ('color' in info) this.add_layer(info);
      if (!info.file) continue;
      const f = info.file;
      this.world.lf2.import(f).then(b => {
        if (!b) return;
        jobs.push(this.get_texture(f, b).then(t => this.add_layer(info, t)))
      });
    }
    this._disposers.push(() => this.fade_out());
    world.scene.add(this.obj_3d);
  }
  fade_out(): void {
    const max_delay = 50;
    const duration = 120;
    for (const layer of this._layers) {
      layer.fade_out(250, Math.random() * max_delay)
    }
    setTimeout(() => {
      this.obj_3d.removeFromParent()
    }, duration + max_delay)

  }

  private add_layer(info: IBgLayerInfo, texture?: THREE.Texture) {
    let { x, y, z, loop = 0 } = info;
    do {
      const layer = new Layer(this, info, x, y, z, texture)
      this.obj_3d.add(layer.mesh);
      this._layers.push(layer)
      x += loop;
    } while (loop > 0 && x < this.width);
  }

  private async get_texture(key: string, path: string): Promise<THREE.Texture> {
    const img_info = await this.world.lf2.img_mgr.load_img(key, path);
    const pic_info = await create_picture(key, img_info);
    return pic_info.texture;
  }

  async get_shadow(): Promise<TPictureInfo> {
    const key = this.data.base.shadow;
    if (!key) return error_picture_info(key)
    try {
      const path = await this.world.lf2.import(key);
      if (!path) return error_picture_info(key);
      const img_info = await this.world.lf2.img_mgr.load_img(key, path)
      const pic_info = await create_picture(key, img_info)
      return pic_info;
    } catch (e) {
      return error_picture_info(key);
    }
  }

  dispose() {
    this._disposers.forEach(f => f());
  }

  private _update_times = 0;
  private _q = new THREE.Quaternion()
  update() {
    this._update_times++;
    for (const layer of this._layers) layer.update(this._update_times)
    this.world.camera.getWorldQuaternion(this._q);
    this.obj_3d.rotation.setFromQuaternion(this._q);
  }
}

