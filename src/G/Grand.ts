import * as THREE from 'three';
import { texture_loader } from './loader/loader';

export class Grand {
  private _disposers: (() => void)[] = [];
  constructor(parent: THREE.Object3D) {
    const planeSize = 40;
    const texture = texture_loader.load(require('./checker.png'));
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);
    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -0.5;
    mesh.scale.set(70, 20, 1);
    mesh.position.y = -2;
    mesh.visible = false;
    parent.add(mesh);
    this._disposers.push(
      () => parent.remove(mesh)
    );
  }
  dispose() {
    this._disposers.forEach(f => f());
  }
}
