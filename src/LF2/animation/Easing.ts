import { clamp, ease_in_out_sine, IEaseMethod, is_num } from "../utils";
import { Animation } from "./Animation";
export class Easing extends Animation {
  protected _val_1 = 0;
  protected _val_2 = 1;
  protected _ease_method: IEaseMethod = ease_in_out_sine;

  get val_1(): number { return this._val_1; }
  set val_1(v: number) { this._val_1 = v; }
  set_val_1(v: number): this { this._val_1 = v; return this; }

  get val_2(): number { return this._val_2; }
  set val_2(v: number) { this._val_2 = v; }
  set_val_2(v: number): this { this._val_2 = v; return this; }

  get ease_method(): IEaseMethod {
    return this._ease_method;
  }
  set ease_method(v: IEaseMethod) {
    this._ease_method = v;
  }

  constructor(begin = 0, end = 1, duration = 250, reverse = false) {
    super()
    this.val_1 = begin;
    this.val_2 = end;
    this.duration = duration;
    this.reverse = reverse;
  }
  set(begin: number, end: number): this {
    this._val_1 = is_num(begin) ? begin : this._val_1;
    this._val_2 = is_num(end) ? end : this._val_2;
    return this;
  }
  set_ease_method(v: IEaseMethod) {
    this._ease_method = v;
    return this;
  }
  override calc(): this {
    const { is_end, time, duration, val_1, val_2, reverse } = this
    if (is_end) {
      this.value = reverse ? val_1 : val_2;
      return this;
    }
    const factor = clamp(time / duration, 0, 1);
    this.value = this._ease_method(factor, val_1, val_2);
    return this;
  }
}
export default Easing;