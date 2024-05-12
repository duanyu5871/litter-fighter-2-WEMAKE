import { is_nan } from "./common/type_check";

export class SineAnimation {
  protected _b: number = 0;
  protected _h: number = 1;
  protected _t: number = 0;
  protected _v: number = 0;
  protected _s: number = 1;
  get value() { return this._v };
  constructor(
    bottom: number = 0,
    height: number = 1,
    scale: number = 1
  ) {
    this.set(bottom, height, scale)
  }
  set(bottom: number, height: number, scale: number): this {
    this._b = is_nan(bottom) ? this._b : bottom;
    this._h = is_nan(height) ? this._h : height;
    this._s = is_nan(bottom) ? this._s : scale;
    this.calc();
    return this;
  }
  update(dt: number) {
    this._t += dt;
    return this.calc();
  }
  protected calc(): number {
    return this._v = this._b + this._h * .5 * Math.sin(this._t * this._s) + .5
  }
}
