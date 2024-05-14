import * as THREE from 'three';
import { TPicture } from '../../LF2/loader/loader';
import { is_num } from '../../common/type_check';
import { dispose_mesh } from '../utils/dispose_mesh';

export class Sprite {
  protected _mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  protected _pic: TPicture;
  protected _w?: number;
  protected _h?: number;
  protected _c_x: number = 0;
  protected _c_y: number = 0;
  get mesh() { return this._mesh; }

  get x(): number { return this._mesh.position.x; }
  set x(v: number) { this._mesh.position.x = v; }

  get y(): number { return this._mesh.position.y; }
  set y(v: number) { this._mesh.position.y = v; }

  get name(): string { return this._mesh.name; }
  set name(v: string) { this._mesh.name = v; }

  get visible(): boolean { return this._mesh.visible; }
  set visible(v: boolean) { this._mesh.visible = v; }

  get opacity(): number { return this._mesh.material.opacity }
  set opacity(v: number) {
    this._mesh.material.opacity = v;
    this._mesh.material.needsUpdate = true;
  }

  get w(): number {
    return is_num(this._w) ? this._w : this._pic.w;
  }

  get h(): number {
    return is_num(this._h) ? this._h : this._pic.h;
  }

  protected create_geometry() {
    const { w, h } = this;
    const tran_x = Math.round(w * (0.5 - this._c_x));
    const tran_y = Math.round(h * (this._c_y - 0.5));
    return new THREE.PlaneGeometry(w, h).translate(tran_x, tran_y, 0)
  }

  constructor(pic: TPicture) {
    this._pic = pic;
    const geo = this.create_geometry();
    this._mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: pic.texture, transparent: true }));
  }

  set_visible(v: boolean): this {
    this._mesh.visible = v;
    return this;
  }

  set_name(v: string): this {
    this._mesh.name = v;
    return this
  }

  set_pos(x: number, y: number): this {
    this._mesh.position.x = x;
    this._mesh.position.y = y;
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
    this._mesh.geometry.dispose();
    this._mesh.geometry = this.create_geometry();

    const { texture } = this._pic;
    if (this._mesh.material.map !== texture) {
      this._mesh.material.map?.dispose();
      this._mesh.material.map = texture;
      this._mesh.material.needsUpdate = true;
    }
    return this;
  }

  /**
   *
   * @note call apply();
   * @param {TPicture} pic
   * @returns {this}
   */
  set_pic(pic: TPicture): this {
    this._pic = pic;
    return this;
  }

  set_rgb(r: number, g: number, b: number): this {
    this._mesh.material.color.setRGB(r, g, b);
    this._mesh.material.needsUpdate = true;
    return this;
  }

  get_rgb(): [number, number, number] {
    const { r, g, b } = this._mesh.material.color;
    return [r, g, b];
  }

  removeFromParent(): void {
    this._mesh.removeFromParent();
  }

  dispose(): void {
    dispose_mesh(this._mesh);
  }
}
