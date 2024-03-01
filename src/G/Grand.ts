import * as THREE from 'three';
import data from './bg/sys/cuhk/bg.json';
import { texture_loader } from './loader/loader';
import World from './World';
import { IBgLayerInfo } from "../js_utils/lf2_type/IBgLayerInfo";
export class Grand {

  private _disposers: (() => void)[] = [];

  depth = data.base.zboundary[1] - data.base.zboundary[0];
  boundarys = {
    left: 0,
    right: data.base.width,
    near: -60,
    far: -180,
  }
  object_3d: THREE.Object3D<THREE.Object3DEventMap>;
  world: World;

  constructor(world: World) {
    this.world = world;
    const node = this.object_3d = new THREE.Object3D();
    node.position.y = -world.camera.position.y
    node.position.z = world.camera.position.z
    node.rotateX(-Math.PI / 4)
    world.scene.add(node);

    var i = 0;
    for (const l of data.layers) {
      const path = require('./' + l.file.replace(/.bmp$/g, '.png'));
      const p = this.get_texture(path);
      const geo = new THREE.PlaneGeometry(1, 1);
      geo.translate(0.5, -0.5, 0)
      const material = new THREE.MeshBasicMaterial({ map: p.texture, transparent: true });
      const sprite = new THREE.Mesh(geo, material)
      const z = i;
      p.then((t) => {
        sprite.scale.set(t.image.width, t.image.height, 1)
        sprite.position.x = l.x;
        sprite.position.y = 550 - l.y;
        sprite.position.z = z - 2 * this.depth;
        sprite.userData.layer = l;
        sprite.userData.width = t.image.width;
        sprite.userData.height = t.image.height;
      })

      sprite.userData.layer = l;
      sprite.userData.width = 0;
      sprite.userData.height = 0;
      // sprite.rotation.x = Math.PI * -0.5;
      i += 1
      node.add(sprite)
    }
    this._disposers.push(
      () => world.scene.remove(node)
    );
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
  update() {
    for (const child of this.object_3d.children) {
      const img_w: number = child.userData.width;
      const img_h: number = child.userData.height;
      const layer: IBgLayerInfo = child.userData.layer;
      if (!img_w || !img_h || !layer) continue;
      const w = this.boundarys.right - this.boundarys.left;
      child.position.x = layer.x +
        (w - layer.width) * this.world.camera.position.x / (w - 794);
    }
    // throw new Error('Method not implemented.');
  }
}

