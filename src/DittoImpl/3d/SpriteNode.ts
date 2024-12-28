import * as THREE from "three";
import LF2 from "../../LF2/LF2";
import { dispose_mesh } from "./disposer";
import { empty_texture } from "../../LF2/loader/loader";
import { is_num } from "../../LF2/utils/type_check";
import { __ObjectNode } from "./ObjectNode";
import { ISpriteInfo, ISpriteNode } from "../../LF2/3d/ISpriteNode";

export default class __SpriteNode extends __ObjectNode implements ISpriteNode {
  readonly is_sprite_node = true;
  protected _info: ISpriteInfo = { w: 0, h: 0 };
  protected _texture: THREE.Texture = empty_texture();
  protected _geo: THREE.PlaneGeometry = new THREE.PlaneGeometry();

  override get inner(): THREE.Mesh<
    THREE.PlaneGeometry,
    THREE.MeshBasicMaterial
  > {
    return this._inner as any;
  }

  override get opacity(): number {
    return this.inner.material.opacity;
  }
  override set opacity(v: number) {
    this.set_opacity(v);
  }

  override get w(): number {
    return is_num(this._w) ? this._w : this._info.w;
  }
  override get h(): number {
    return is_num(this._h) ? this._h : this._info.h;
  }

  protected next_geometry(): THREE.PlaneGeometry {
    const { w, h, _c_x, _c_y, _c_z } = this;
    const { w: _w, h: _h, c_x, c_y, c_z } = this._geo.userData;

    if (w === _w && h === _h && c_x === _c_x && c_y === _c_y && c_z === _c_z)
      return this._geo;
    this._geo.dispose();

    const tran_x = Math.round(w * (0.5 - _c_x));
    const tran_y = Math.round(h * (_c_y - 0.5));
    const tran_z = Math.round(_c_z);
    const ret = new THREE.PlaneGeometry(w, h).translate(tran_x, tran_y, tran_z);
    ret.userData.w = w;
    ret.userData.h = h;
    ret.userData.c_x = _c_x;
    ret.userData.c_y = _c_y;
    return (this._geo = ret);
  }

  constructor(lf2: LF2, info?: ISpriteInfo) {
    super(lf2);
    info && this.set_info(info);
    const [r, g, b] = this._rgb;
    const geo = this.next_geometry();
    const mp: THREE.MeshBasicMaterialParameters = { transparent: true };
    mp.map = this._texture;
    mp.color = new THREE.Color(r / 255, g / 255, b / 255);
    this._inner = new THREE.Mesh(geo, new THREE.MeshBasicMaterial(mp));
  }

  override set_opacity(v: number): this {
    this.inner.material.opacity = v;
    this.inner.material.needsUpdate = true;
    return super.set_opacity(v);
  }

  override apply(): this {
    super.apply();
    const { inner: mesh } = this;

    mesh.geometry = this.next_geometry();
    const {
      _texture,
      _rgb: [_r, _g, _b],
    } = this;
    if (mesh.material.map !== _texture) {
      mesh.material.map?.dispose();
      mesh.material.map = _texture;
      mesh.material.needsUpdate = true;
    }
    const { r, g, b } = mesh.material.userData;
    if (r !== _r || g !== _g || b !== _b) {
      mesh.material.color = new THREE.Color(_r / 255, _g / 255, _b / 255);
      mesh.material.userData.r = _r;
      mesh.material.userData.g = _g;
      mesh.material.userData.b = _b;
      mesh.material.needsUpdate = true;
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
    this._rgb = [Math.ceil(r * 255), Math.ceil(g * 255), Math.ceil(b * 255)];
    this._texture = info.texture || empty_texture();
    return this;
  }
  get_info(): ISpriteInfo {
    return this._info;
  }
  override dispose(): void {
    super.dispose();
    dispose_mesh(this.inner);
  }
}
