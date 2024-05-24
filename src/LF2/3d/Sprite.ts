import * as THREE from 'three';
import { dispose_mesh } from '../layout/utils/dispose_mesh';
import { empty_texture } from '../loader/loader';
import { is_num } from '../utils/type_check';
import INode from './INode';
export interface ISpriteInfo {
  w: number;
  h: number;
  texture?: THREE.Texture;
  color?: string;
}
export default class Sprite implements INode {
  protected _mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  protected _info: ISpriteInfo = { w: 0, h: 0 };
  protected _w?: number;
  protected _h?: number;
  protected _c_x: number = 0;
  protected _c_y: number = 0;
  protected _parent?: INode;

  protected _texture: THREE.Texture = empty_texture();
  protected _rgb: [number, number, number] = [255, 255, 255];
  protected _geo: THREE.PlaneGeometry = new THREE.PlaneGeometry();

  get mesh() { return this._mesh; }

  get x(): number { return this._mesh.position.x; }
  set x(v: number) { this._mesh.position.x = v; }

  get y(): number { return this._mesh.position.y; }
  set y(v: number) { this._mesh.position.y = v; }

  get z(): number { return this._mesh.position.z; }
  set z(v: number) { this._mesh.position.z = v; }

  get name(): string { return this._mesh.name; }
  set name(v: string) { this.set_name(v); }

  get visible(): boolean { return this._mesh.visible; }
  set visible(v: boolean) { this.set_visible(v); }

  get opacity(): number { return this._mesh.material.opacity }
  set opacity(v: number) { this.set_opacity(v) }

  get w(): number { return is_num(this._w) ? this._w : this._info.w; }
  get h(): number { return is_num(this._h) ? this._h : this._info.h; }

  get size(): [number, number] { return [this.w, this.h] }
  set size([w, h]: [number, number]) { this.set_size(w, h); }

  unset_size(): this { this._w = this._h = void 0; return this; }

  protected next_geometry(): THREE.PlaneGeometry {
    const { w, h, _c_x, _c_y } = this;
    const { w: _w, h: _h, c_x, c_y } = this._geo.userData;

    if (w === _w && h === _h && c_x === _c_x && c_y === _c_y)
      return this._geo;
    this._geo.dispose();

    const tran_x = Math.round(w * (0.5 - _c_x));
    const tran_y = Math.round(h * (_c_y - 0.5));
    const ret = new THREE.PlaneGeometry(w, h).translate(tran_x, tran_y, 0);
    ret.userData.w = w;
    ret.userData.h = h;
    ret.userData.c_x = _c_x;
    ret.userData.c_y = _c_y;
    return this._geo = ret;
  }

  constructor(info?: ISpriteInfo) {
    info && this.set_info(info)
    const [r, g, b] = this._rgb;
    const geo = this.next_geometry();
    const mp: THREE.MeshBasicMaterialParameters = { transparent: true }
    mp.map = this._texture;
    mp.color = new THREE.Color(r / 255, g / 255, b / 255)
    this._mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial(mp));
  }
  get parent(): INode | undefined { return this._parent; }
  set parent(v: INode | undefined) { this._parent = v; }
  get user_data(): Record<string, any> {
    return this.mesh.userData;
  }
  get rgb(): [number, number, number] { return this._rgb }
  set rgb([r, g, b]: [number, number, number]) {
    this.set_rgb(r, g, b);
    this.apply();
  }
  set_x(x: number): this {
    this.mesh.position.x = x;
    return this;
  }
  set_y(y: number): this {
    this.mesh.position.y = y;
    return this;
  }
  set_z(z: number): this {
    this.mesh.position.z = z;
    return this;
  }

  set_opacity(v: number): this {
    this._mesh.material.opacity = v;
    this._mesh.material.needsUpdate = true;
    return this;
  }

  set_visible(v: boolean): this {
    this._mesh.visible = v;
    return this;
  }

  set_name(v: string): this {
    this._mesh.name = v;
    return this
  }

  set_pos(x: number, y: number, z: number = this._mesh.position.z): this {
    this._mesh.position.set(x, y, z)
    return this
  }

  /**
   * @note call apply();
   * @param {number} w
   * @param {number} h
   * @returns {this}
   */
  set_size(w: number, h: number): this {
    this._w = w;
    this._h = h;
    return this;
  }

  /**
   * @note call apply();
   * @param {number} x
   * @param {number} y
   * @returns {this}
   */
  set_center(x: number, y: number): this {
    this._c_x = x;
    this._c_y = y;
    return this;
  }

  apply(): this {
    this._mesh.geometry = this.next_geometry();
    const { _texture, _rgb: [_r, _g, _b] } = this;
    if (this._mesh.material.map !== _texture) {
      this._mesh.material.map?.dispose();
      this._mesh.material.map = _texture;
      this._mesh.material.needsUpdate = true;
    }
    const { r, g, b } = this._mesh.material.userData;
    if (r !== _r || g !== _g || b !== _b) {
      this._mesh.material.color = new THREE.Color(_r / 255, _g / 255, _b / 255)
      this._mesh.material.userData.r = _r;
      this._mesh.material.userData.g = _g;
      this._mesh.material.userData.b = _b;
      this._mesh.material.needsUpdate = true;
    }
    return this;
  }

  /**
   *
   * @note call apply();
   * @param {ISpriteInfo} info
   * @returns {this}
   */
  set_info(info: ISpriteInfo): this {
    this._info = info;
    const { r, g, b } = new THREE.Color(info.color);
    this._rgb = [
      Math.ceil(r * 255),
      Math.ceil(g * 255),
      Math.ceil(b * 255)
    ]
    this._texture = info.texture || empty_texture();
    return this;
  }


  /**
   * 
   * @note call apply();
   * @param {number} r
   * @param {number} g
   * @param {number} b
   * @returns {this}
   */
  set_rgb(r: number, g: number, b: number): this {
    this._rgb = [r, g, b];
    return this;
  }

  get_rgb(): [number, number, number] {
    return this._rgb;
  }

  dispose(): void {
    dispose_mesh(this._mesh);
  }
  protected _children: INode[] = [];
  get children() { return this._children; }

  add(...nodes: INode[]): this {
    for (const node of nodes) {
      node.parent = this;
      if (node instanceof Sprite)
        this.mesh.add(node.mesh);
    }

    return this;
  }

  del(...nodes: INode[]): this {
    for (const node of nodes) {
      if (node.parent === this)
        node.parent = void 0;
      if (node instanceof Sprite)
        this.mesh.remove(node.mesh);
    }
    return this;
  }

  del_self(): void {
    if (this._parent) this._parent.del(this)
    else this._mesh.removeFromParent();
  }

  get_user_data(key: string): any {
    return this.mesh.userData[key]
  }

  add_user_data(key: string, value: any): this {
    this.mesh.userData[key] = value;
    return this;
  }

  del_user_data(key: string): this {
    delete this.mesh.userData[key];
    return this;
  }

  merge_user_data(v: Record<string, any>): this {
    Object.assign(this.mesh.userData, v);
    return this;
  }
}
