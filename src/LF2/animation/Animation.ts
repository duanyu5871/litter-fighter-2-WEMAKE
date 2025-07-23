import { clamp } from "../utils/math/clamp";
import { IAnimation } from "./IAnimation";
const { max } = Math;

export abstract class Animation implements IAnimation {
  protected _v: number = 0;
  protected _t: number = 0;
  protected _d: number = 0
  reverse: boolean = false;

  get duration(): number { return this._d; }
  set duration(v: number) { this.set_duration(v) }
  set_duration(v: number): this {
    this._d = max(0, v);
    this._t = clamp(this._t, 0, this._d)
    return this
  }

  get value(): number { return this._v; }
  set value(v: number) { this.set_value(v) }
  set_value(v: number): this { this._v = v; return this }

  get time(): number { return this._t; }
  set time(v: number) { this.set_time(v); }
  set_time(v: number): this { this._t = clamp(v, 0, this.duration); return this }
  end(reverse: boolean = this.reverse): this {
    this.reverse = reverse;
    this.time = reverse ? 0 : this.duration
    return this;
  }
  calc(): this {
    this.value = this.time / this.duration;
    return this;
  }
  update(dt: number): this {
    const t = this.reverse ? this.time - dt : this.time + dt;
    this.time = clamp(t, 0, this.duration);
    this.calc();
    return this;
  }
}
