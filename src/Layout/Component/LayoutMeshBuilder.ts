import * as THREE from 'three';

export default class LayoutMeshBuilder {
  static create(): LayoutMeshBuilder {
    return new LayoutMeshBuilder();
  }
  protected constructor() { }
  protected c_x: number = 0;
  protected c_y: number = 0;
  protected w: number = 1;
  protected h: number = 1;
  protected x: number = 0;
  protected y: number = 0;
  protected _z: number = 0;
  size(w: number, h: number): this {
    this.w = w;
    this.h = h;
    return this
  }
  pos(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }
  z(z: number): this {
    this._z = z;
    return this;
  }
  center(x: number, y: number): this {
    this.c_x = x;
    this.c_y = y;
    return this;
  }
  build(parameters?: THREE.MeshBasicMaterialParameters | undefined): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
    const [geo, material] = this.build_args(parameters);
    const ret = new THREE.Mesh(geo, material)
    ret.position.x = this.x;
    ret.position.y = this.y;
    ret.position.z = this._z;
    return ret;
  }
  build_args(parameters?: THREE.MeshBasicMaterialParameters | undefined): [THREE.PlaneGeometry, THREE.MeshBasicMaterial] {
    const material = new THREE.MeshBasicMaterial(parameters)
    return [this.build_geometry(), material];
  }
  build_geometry(): THREE.PlaneGeometry {
    const { w, h } = this;
    const center_x = Math.round((0.5 - this.c_x) * w);
    const center_y = Math.round((this.c_y - 0.5) * h);
    return new THREE.PlaneGeometry(w, h).translate(center_x, center_y, 0);
  }
}