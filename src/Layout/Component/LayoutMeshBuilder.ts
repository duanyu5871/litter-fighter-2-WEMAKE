import * as THREE from 'three';
/** @deprecated */
export interface ILayoutMeshInfo {
  c_x: number;
  c_y: number;
  _w: number;
  _h: number;
  _x: number;
  _y: number;
  _z: number;
}
/** @deprecated */
export default class LayoutMeshBuilder {
  static create(): LayoutMeshBuilder {
    return new LayoutMeshBuilder();
  }
  protected constructor() { }
  protected _info: ILayoutMeshInfo = new class {
    c_x: number = 0;
    c_y: number = 0;
    _w: number = 1;
    _h: number = 1;
    _x: number = 0;
    _y: number = 0;
    _z: number = 0;
  }()

  size(w: number, h: number): this {
    this._info._w = w;
    this._info._h = h;
    return this
  }
  pos(x: number, y: number): this {
    this._info._x = x;
    this._info._y = y;
    return this;
  }
  z(z: number): this {
    this._info._z = z;
    return this;
  }
  center(x: number, y: number): this {
    this._info.c_x = x;
    this._info.c_y = y;
    return this;
  }
  build(parameters?: THREE.MeshBasicMaterialParameters | undefined): THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial> {
    const [geo, material] = this.build_args(parameters);
    const ret = new THREE.Mesh(geo, material)
    ret.position.x = this._info._x;
    ret.position.y = this._info._y;
    ret.position.z = this._info._z;
    ret.userData = { ...this._info }
    return ret;
  }
  build_args(parameters?: THREE.MeshBasicMaterialParameters | undefined): [THREE.PlaneGeometry, THREE.MeshBasicMaterial] {
    const material = new THREE.MeshBasicMaterial(parameters)
    return [this.build_geometry(), material];
  }
  build_geometry(): THREE.PlaneGeometry {
    const { _w, _h } = this._info;
    const center_x = Math.round((0.5 - this._info.c_x) * _w);
    const center_y = Math.round((this._info.c_y - 0.5) * _h);
    return new THREE.PlaneGeometry(_w, _h).translate(center_x, center_y, 0);
  }
}