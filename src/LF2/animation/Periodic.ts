import { clamp, is_num } from "../utils";
import type { IAnimation } from "./IBase";


export abstract class Periodic implements IAnimation {
  offset: number = 0;
  protected _b: number = 0;
  protected _h: number = 1;
  protected _t: number = 0;
  protected _v: number = 0;
  protected _s: number = 1;
  duration: number = Number.MAX_SAFE_INTEGER;
  reverse: boolean = false;


  set_duration(v: number): this {
    this.duration = v;
    return this;
  }
  set_offset(v: number): this {
    this.offset = v;
    return this
  }
  get value() {
    return this._v;
  }
  get time(): number {
    return this._t;
  }
  set time(v: number) {
    this._t = clamp(v, 0, this.duration);
  }
  get bottom(): number { return this._b; }
  set bottom(v: number) { if (is_num(v)) { this._b = v; } }
  get height(): number { return this._h; }
  set height(v: number) { if (is_num(v)) { this._h = v; } }
  get scale(): number { return this._s; }
  set scale(v: number) { if (is_num(v)) { this._s = v; } }
  abstract method(v: number): number;

  constructor(bottom: number = 0, height: number = 1, scale: number = 1) {
    if (is_num(bottom)) this._b = bottom;
    if (is_num(height)) this._h = height;
    if (is_num(scale)) this._s = scale;
  }

  end(reverse: boolean = this.reverse): this {
    this.reverse = reverse;
    this.time = this.duration;
    return this;
  }

  set(bottom: number, height: number, scale: number): this {
    if (is_num(bottom)) this._b = bottom;
    if (is_num(height)) this._h = height;
    if (is_num(scale)) this._s = scale;
    this.calc();
    return this;
  }

  update(dt: number): this {
    this.time += dt;
    this.calc();
    return this;
  }


  calc(): this {
    this._v = this.method(this._t * this._s);
    return this;
  }
}
