import * as THREE from 'three';
import { ITexturePieceInfo } from '../../js_utils/lf2_type/ITexturePieceInfo';
import { Entity } from './Entity';
export const EMPTY_ARR = [] as const;
export const INDICATORS_COLOR = {
  bdy: 0x00ff00,
  itr: 0xff0000,
  main: 0xffff00,
}
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  0, 1, 1,
  1, 1, 1,
  1, 1, 1,
  1, 0, 1,
  1, 0, 1,
  0, 0, 1,
  0, 0, 1,
  0, 1, 1,
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

export class EntityIndicators {
  protected _entity: Entity;
  protected _show = false;
  protected _indicators_map = {
    bdy: new Array<THREE.Object3D>(),
    itr: new Array<THREE.Object3D>(),
  };
  protected get sprite() { return this._entity.sprite; };
  protected get scene() { return this._entity.world.scene; };
  protected _box?: THREE.Object3D;
  protected get frame() { return this._entity.get_frame(); }
  protected get face() { return this._entity.face; }
  get show() { return this._show; }
  set show(v: boolean) {
    if (this._show === v) return;
    this._show = v;
    if (v) {
      this.show_box();
    } else {
      this.hide_indicators('bdy');
      this.hide_indicators('itr');
      this.hide_box();
    }
  }

  constructor(e: Entity) {
    this._entity = e;
  }

  protected _new_indicator(k: keyof typeof this._indicators_map, idx: number) {
    const material = new THREE.LineBasicMaterial({ color: INDICATORS_COLOR[k] });
    const ret = this._indicators_map[k][idx] = new THREE.LineSegments(geometry, material);
    this.sprite.add(ret);
    return ret;
  }

  protected _update_indicator(k: keyof typeof this._indicators_map, idx: number, info: ITexturePieceInfo) {
    const indicator = this._indicators_map[k][idx] ?? this._new_indicator(k, idx);
    const { x, y, w, h } = info;
    indicator.position.set(x, y, 0);
    indicator.scale.set(w, h, 1);
  }

  protected _del_indicator(k: keyof typeof this._indicators_map, idx: number) {
    const [indicator] = this._indicators_map[k].splice(idx, 1);
    indicator && this.sprite.remove(indicator)
  }

  private _unsafe_update_box() {
    const { x: cx, y: cy } = this.sprite.center;
    this._box!.position.set(0.5 - cx, 0.5 - cy, 0)
  }

  private _update_indicators(name: keyof typeof this._indicators_map) {
    const data = this.frame[name] || EMPTY_ARR;
    const data_len = data.length;
    const indicator_len = Math.max(this._indicators_map[name].length, data_len);
    for (let i = 0; i < indicator_len; ++i) {
      if (i >= data_len) {
        this._del_indicator(name, i);
        continue;
      }
      const info = data[i].indicator_info?.[this.face];
      if (!info) {
        this._del_indicator(name, i);
        continue;
      }
      this._update_indicator(name, i, info);
    }
  }
  show_indicators(name: keyof typeof this._indicators_map) {
    const data = this.frame[name] || EMPTY_ARR;
    for (let i = 0; i < data.length; ++i) {
      const info = data[i].indicator_info?.[this.face];
      if (!info) continue;
      this._update_indicator(name, i, info);
    }
  }
  hide_indicators(k: keyof typeof this._indicators_map) {
    for (const i of this._indicators_map[k])
      this.sprite.remove(i)
    this._indicators_map[k].length = 0
  }
  show_box() {
    if (this._box) return;
    const edges = new THREE.EdgesGeometry(this._entity.sprite.geometry);
    const material = new THREE.LineBasicMaterial({ color: INDICATORS_COLOR.main })
    this._box = new THREE.LineSegments(edges, material);
    this.sprite.add(this._box);
    this._unsafe_update_box()
  }
  hide_box() {
    if (!this._box) return;
    this.sprite.remove(this._box);
    delete this._box;
  }
  update() {
    if (!this._show) return;
    this._box && this._unsafe_update_box();
    this._update_indicators('bdy');
    this._update_indicators('itr');
  }
}
