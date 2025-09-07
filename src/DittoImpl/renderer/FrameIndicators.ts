import type { IObjectNode } from "../../LF2/3d";
import { Ditto } from "../../LF2/ditto";
import type { Entity } from "../../LF2/entity/Entity";
import { traversal } from "../../LF2/utils/container_help/traversal";
import * as THREE from "../3d/_t";
import type { WorldRenderer } from "./WorldRenderer";
export const EMPTY_ARR = [] as const;
export const INDICATORS_COLOR = {
  bdy: 0x00ff00,
  itr: 0xff0000,
  main: 0xffff00,
};
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 1,
]);
geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
export class FrameIndicators {
  readonly renderer_type: string = "FrameIndicators";
  protected _entity: Entity;
  protected _box?: IObjectNode;
  protected _indicators_map = {
    bdy: new Array<IObjectNode>(),
    itr: new Array<IObjectNode>(),
  };
  private _x: number = 0;
  private _y: number = 0;
  private _z: number = 0;
  get scene() {
    return (this._entity.world.renderer as WorldRenderer).scene;
  }
  get frame() {
    return this._entity.frame;
  }
  get face() {
    return this._entity.facing;
  }
  private _flags: number = 0;
  set flags(v: number) {
    if (this._flags === v) return;
    this._flags = v;
    this.render();
  }

  constructor(entity: Entity) {
    this._entity = entity;
  }
  get visible(): boolean {
    throw new Error("Method not implemented.");
  }
  set visible(v: boolean) {
    throw new Error("Method not implemented.");
  }

  protected _new_indicator(k: keyof typeof this._indicators_map, idx: number) {
    const ret = (this._indicators_map[k][idx] = new Ditto.LineSegmentsNode(
      this._entity.lf2,
      { color: INDICATORS_COLOR[k], linewidth: 100 },
    ));
    this.scene.add(ret);
    return ret;
  }

  protected _del_indicator(k: keyof typeof this._indicators_map, idx: number) {
    const [indicator] = this._indicators_map[k].splice(idx, 1);
    indicator && this.scene.del(indicator);
  }

  private _unsafe_update_box() {
    const { indicator_info } = this._entity.frame;
    if (!indicator_info) return;
    const ii = indicator_info[this._entity.facing];
    const y = this._y + ii.y;
    const x = this._x + ii.x;
    if (!this._box) return;
    this._box.set_position(x, y, this._z);
    this._box.set_scale(ii.w, ii.h, 1);
  }

  show_indicators(name: keyof typeof this._indicators_map) {
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
      const indicator =
        this._indicators_map[name][i] ?? this._new_indicator(name, i);
      const y = this._y + info.y;
      const x = this._x + info.x;
      indicator.set_position(x, y, this._z);
      indicator.set_scale(info.w, info.h, 1);
    }
  }

  hide_indicators(k: keyof typeof this._indicators_map) {
    for (const i of this._indicators_map[k]) this.scene.del(i);
    this._indicators_map[k].length = 0;
  }

  show_box() {
    if (!this._box) {
      this._box = new Ditto.LineSegmentsNode(this._entity.lf2, {
        color: INDICATORS_COLOR.main,
        linewidth: 100,
      });
      this.scene.add(this._box);
    }
    this._unsafe_update_box();
  }

  hide_box() {
    if (!this._box) return;
    this.scene.del(this._box);
    delete this._box;
  }

  on_mount(): void {
    this.hide_box()
    this.hide_indicators("bdy");
    this.hide_indicators("itr");
  }

  on_unmount() {
    if (this._box) this.scene.del(this._box);
    traversal(this._indicators_map, (_, list) => {
      list.forEach((item) => this.scene.del(item));
      list.length = 0;
    });
  }

  render() {
    if (!this._flags) return;
    const { x: game_x, y: game_y, z: game_z } = this._entity.position;
    this._x = game_x;
    this._y = game_y - game_z / 2;
    this._z = game_z;
    if (this._flags & 1) this.show_box();
    else this.hide_box();
    if (this._flags & 2) this.show_indicators("itr");
    else this.hide_indicators("itr");
    if (this._flags & 4) this.show_indicators("bdy");
    else this.hide_indicators("bdy");
  }
}
