import * as THREE from 'three';
import { World } from '../World';
import { IBgData } from '../defines';
import { IBgLayerInfo } from "../defines/IBgLayerInfo";
import { Defines } from '../defines/defines';
import { TPicture } from '../loader/loader';
import Layer from './Layer';
import { IObjectNode } from '../3d/IObjectNode';
import Ditto from '../ditto';

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

  get id(): string { return this.data.id }
  get left(): number { return this.data.base.left }
  get right(): number { return this.data.base.right }
  get near(): number { return this.data.base.near }
  get far(): number { return this.data.base.far }
  readonly width: number;
  readonly depth: number;

  readonly middle: { x: number, z: number };
  readonly obj_3d: IObjectNode;
  readonly world: World;

  constructor(world: World, data: IBgData) {
    this.data = data;
    this.world = world;

    this.width = this.data.base.right - this.data.base.left
    this.depth = this.data.base.near - this.data.base.far
    this.middle = {
      x: (this.data.base.right + this.data.base.left) / 2,
      z: (this.data.base.far + this.data.base.near) / 2,
    }
    this.obj_3d = new Ditto.ObjectNode(world.lf2);
    this.obj_3d.z = -2 * Defines.CLASSIC_SCREEN_HEIGHT;
    this.obj_3d.name = Background.name + ':' + this.data.base.name;
    for (const info of data.layers) {
      if ('color' in info) this.add_layer(info);
      if (!info.file) continue;
      const pic = this.world.lf2.images.create_pic_by_img_key(info.file)
      this.add_layer(info, pic);
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
      this.obj_3d.del_self()
    }, duration + max_delay)

  }

  private add_layer(info: IBgLayerInfo, pic?: TPicture) {
    let { x, y, z, loop = 0 } = info;
    do {
      const layer = new Layer(this, info, x, y, z, pic)
      this.obj_3d.add(layer.mesh);
      this._layers.push(layer)
      x += loop;
    } while (loop > 0 && x < this.width);
  }

  get_shadow(): TPicture {
    return this.world.lf2.images.create_pic_by_img_key(this.data.base.shadow)
  }

  dispose() {
    this._disposers.forEach(f => f());
  }

  private _update_times = 0;
  private _q = new THREE.Quaternion()
  update() {
    this._update_times++;
    for (const layer of this._layers) layer.update(this._update_times)
    this.world.camera.world_quaternion(this._q);
    this.obj_3d.rotation_from_quaternion(this._q);
  }
}

