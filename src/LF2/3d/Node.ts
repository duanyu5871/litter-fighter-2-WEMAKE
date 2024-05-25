import * as THREE from 'three';
import { is_num } from '../utils/type_check';
import INode from './INode';

export default class Node implements INode {
  protected _parent?: INode;
  protected _children: INode[] = [];
  protected _inner: THREE.Object3D = new THREE.Object3D();
  protected _rgb: [number, number, number] = [255, 255, 255];
  protected _w?: number;
  protected _h?: number;
  protected _c_x: number = 0;
  protected _c_y: number = 0;
  protected _c_z: number = 0;
  protected _opacity: number = 1;

  get parent(): INode | undefined { return this._parent; }
  set parent(v: INode | undefined) { this._parent = v; }
  get children(): readonly INode[] { return this._children; }
  get x(): number { return this._inner.position.x; }
  set x(v: number) { this._inner.position.x = v; }
  get y(): number { return this._inner.position.y; }
  set y(v: number) { this._inner.position.y = v; }
  get z(): number { return this._inner.position.z; }
  set z(v: number) { this._inner.position.z = v; }
  get name(): string { return this._inner.name; }
  set name(v: string) { this.set_name(v); }
  get visible(): boolean { return this._inner.visible; }
  set visible(v: boolean) { this.set_visible(v); }
  get opacity(): number { return 1; }
  set opacity(v: number) { }
  get w(): number { return is_num(this._w) ? this._w : 0; }
  get h(): number { return is_num(this._h) ? this._h : 0; }
  get size(): [number, number] { return [this.w, this.h] }
  set size([w, h]: [number, number]) { this.set_size(w, h); }
  get user_data(): Record<string, any> { return this._inner.userData; }
  get rgb(): [number, number, number] { return this._rgb }
  set rgb([r, g, b]: [number, number, number]) {
    this.set_rgb(r, g, b);
    this.apply();
  }
  get inner(): THREE.Object3D { return this._inner }

  unset_size(): this { this._w = this._h = void 0; return this; }
  set_opacity(v: number): this { this._opacity = v; return this; }
  set_visible(v: boolean): this { this._inner.visible = v; return this; }
  set_name(v: string): this { this._inner.name = v; return this }
  set_x(x: number): this { this._inner.position.x = x; return this; }
  set_y(y: number): this { this._inner.position.y = y; return this; }
  set_z(z: number): this { this._inner.position.z = z; return this; }
  set_pos(x?: number, y?: number, z?: number): this {
    const p = this._inner.position;
    p.set(x ?? p.x, y ?? p.y, z ?? p.z);
    return this;
  }
  set_size(w?: number, h?: number): this {
    this._w = w ?? this._w;
    this._h = h ?? this._h;
    return this;
  }
  set_center(x?: number, y?: number, z?: number): this {
    this._c_x = x ?? this._c_x;
    this._c_y = y ?? this._c_y;
    this._c_z = z ?? this._c_z;
    return this;
  }
  apply(): this { return this; }
  add(...nodes: INode[]): this {
    for (const node of nodes) {
      node.parent = this;
      if (node instanceof Node)
        this.inner.add(node.inner);
    }
    return this;
  }
  del(...nodes: INode[]): this {
    for (const node of nodes) {
      if (node.parent === this)
        node.parent = void 0;
      if (node instanceof Node)
        this.inner.remove(node.inner);
    }
    return this;
  }
  del_self(): void {
    if (this._parent) this._parent.del(this)
    else this._inner.removeFromParent();
  }
  dispose(): void {
    this.del_self();
  }
  get_user_data(key: string) {
    return this._inner.userData[key]
  }
  add_user_data(key: string, value: any): this {
    this._inner.userData[key] = value;
    return this;
  }
  del_user_data(key: string): this {
    delete this._inner.userData[key];
    return this;
  }
  merge_user_data(v: Record<string, any>): this {
    Object.assign(this._inner.userData, v);
    return this;
  }
  set_rgb(r: number, g: number, b: number): this {
    this._rgb = [r, g, b];
    return this;
  }
}
