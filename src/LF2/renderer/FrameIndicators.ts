import * as THREE from 'three';
import { IMeshNode, IObjectNode } from '../3d';
import { IRect } from '../defines/IRect';
import Ditto from '../ditto';
import Entity from '../entity/Entity';
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

export class FrameIndicators {
  protected _entity: Entity;
  protected _show = false;
  protected _indicators_map = {
    bdy: new Array<IObjectNode>(),
    itr: new Array<IObjectNode>(),
  };
  private _x: number = 0;
  private _y: number = 0;
  private _z: number = 0;
  protected get scene() { return this._entity.world.scene; };
  protected _box?: IObjectNode;
  protected get frame() { return this._entity.frame; }
  protected get face() { return this._entity.facing; }
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

  constructor(entity: Entity, entity_mesh: IMeshNode) {
    this._entity = entity;
  }

  protected _new_indicator(k: keyof typeof this._indicators_map, idx: number) {
    const ret = this._indicators_map[k][idx] = new Ditto.LineSegmentsNode(this._entity.lf2, { color: INDICATORS_COLOR[k] });
    this.scene.add(ret);
    return ret;
  }

  protected _update_indicator(k: keyof typeof this._indicators_map, idx: number, ii: IRect) {
    const indicator = this._indicators_map[k][idx] ?? this._new_indicator(k, idx);
    const y = this._y + ii.y;
    const x = this._x + ii.x;
    indicator.set_position(x, y, this._z)
    indicator.set_scale(ii.w, ii.h, 1);
  }

  protected _del_indicator(k: keyof typeof this._indicators_map, idx: number) {
    const [indicator] = this._indicators_map[k].splice(idx, 1);
    indicator && this.scene.del(indicator)
  }

  private _unsafe_update_box() {
    const { indicator_info } = this._entity.frame;
    if (!indicator_info) return;
    const ii = indicator_info[this._entity.facing];
    const y = this._y + ii.y;
    const x = this._x + ii.x;
    if (!this._box) return;
    this._box.set_position(x, y, this._z)
    this._box.set_scale(ii.w, ii.h, 1);
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
      this.scene.del(i)
    this._indicators_map[k].length = 0
  }
  show_box() {
    if (this._box) return;
    this._box = new Ditto.LineSegmentsNode(this._entity.lf2, { color: INDICATORS_COLOR.main });
    this.scene.add(this._box);
  }
  hide_box() {
    if (!this._box) return;
    this.scene.del(this._box);
    delete this._box;
  }
  update() {
    if (!this._show) return;
    const { x: game_x, y: game_y, z: game_z } = this._entity.position;
    this._x = game_x;
    this._y = game_y - game_z / 2;
    this._z = game_z;
    this._box && this._unsafe_update_box();
    this._update_indicators('bdy');
    this._update_indicators('itr');
  }
}
