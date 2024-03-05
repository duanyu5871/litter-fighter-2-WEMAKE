import * as THREE from 'three';
import { IBgData } from '../js_utils/lf2_type';
import { IBgLayerInfo } from "../js_utils/lf2_type/IBgLayerInfo";
import { World } from './World';
import { texture_loader } from './loader/loader';

interface ILayerUserData {
  x: number;
  y: number;
  z: number;
  layer: IBgLayerInfo;
  inner_w?: number;
  inner_h?: number;
  owner: Background;
}

export class Background {
  private _disposers: (() => void)[] = [];
  readonly data: IBgData;
  object_3d: THREE.Object3D;
  world: World;
  private _z_order = 0
  constructor(world: World, data: IBgData) {
    this.data = data;
    this.world = world;

    const node = this.object_3d = new THREE.Object3D();
    this.object_3d.position.y = -this.world.camera.position.y
    this.object_3d.position.z = -1000
    world.scene.add(node);

    for (const info of data.layers) {
      const z = this._z_order;
      if ('color' in info) this.add_layer(info, z);
      let path: any;
      if (!info.file) continue;
      if (!path) try { path = require('./' + info.file.replace(/.bmp$/g, '.png')); } catch (e) { }
      if (!path) try { path = require('./' + info.file + '.png'); } catch (e) { }
      if (!path) try { path = require('./' + info.file); } catch (e) { }
      if (!path) { continue; }
      this.get_texture(path).then(t => this.add_layer(info, z, t))
      this._z_order += 1
    }
    this._disposers.push(
      () => world.scene.remove(node)
    );
  }

  private add_layer(info: IBgLayerInfo, z: number, t?: THREE.Texture) {
    const data = this.data;
    const node = this.object_3d
    let count = 0;
    do {
      let { x, y, loop } = info;
      if (loop) x += count * loop;
      const geo = new THREE.PlaneGeometry(1, 1);
      geo.translate(0.5, -0.5, 0);
      const material = new THREE.MeshBasicMaterial(
        t ? { map: t, transparent: true } : { color: info.color }
      );
      const layer = new THREE.Mesh(geo, material);
      if (t) layer.scale.set(t.image.width, t.image.height, 1)
      else layer.scale.set(info.width, info.height, 1);
      layer.position.x = x;
      layer.position.y = 550 - y;
      layer.position.z = z - 2 * (data.base.near - data.base.far);
      const user_data: ILayerUserData = {
        x: layer.position.x,
        y: layer.position.y,
        z: layer.position.z,
        layer: info,
        inner_w: t?.image.width ?? info.width,
        inner_h: t?.image.height ?? info.width,
        owner: this
      }
      layer.userData = user_data;
      node.add(layer);
      ++count;
      if (x > data.base.right - data.base.left) break;
    } while (info.loop);
  }

  private get_texture(p: any) {
    let _resolve = (data: THREE.Texture) => { }
    let _reject = (err: unknown) => { }
    const _on_load = (data: THREE.Texture) => { _resolve(data) }
    const _on_error = (err: unknown) => { _reject(err) }
    const texture = texture_loader.load(p, _on_load, void 0, _on_error);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const ret: Promise<THREE.Texture> & { texture?: THREE.Texture } =
      new Promise((a, b) => { _resolve = a; _reject = b; });
    ret.texture = texture
    return ret
  }

  dispose() {
    this._disposers.forEach(f => f());
  }

  private _q = new THREE.Quaternion()
  private _screen_width = 794;
  update() {
    const { camera } = this.world;
    for (const child of this.object_3d.children) {
      const user_data = child.userData as ILayerUserData;
      const { inner_w: img_w, inner_h: img_h, layer: { width }, x } = user_data;
      if (!img_w || !img_h) continue;
      const bg_width = this.data.base.right - this.data.base.left;
      if (bg_width <= this._screen_width) continue;
      child.position.x = x + (bg_width - width) * camera.position.x / (bg_width - this._screen_width);
    }
    camera.getWorldQuaternion(this._q)
    this.object_3d.rotation.setFromQuaternion(this._q);
  }
}

