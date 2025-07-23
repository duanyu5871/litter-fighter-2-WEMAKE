import { clamp, ease_in_out_sine, IEaseMethod } from "../utils";
import { IAnimation } from "./IAnimation";
export class Easing implements IAnimation {
  protected _val_1 = 0;
  protected _val_2 = 1;
  protected _duration = 250;
  protected _reverse = false;
  protected _time = 0;
  protected _ease_method: IEaseMethod = ease_in_out_sine;
  protected _value = 0;

  get val_1(): number {
    return this._val_1;
  }
  set val_1(v: number) {
    this._val_2 = v;
  }
  get val_2(): number {
    return this._val_2;
  }
  set val_2(v: number) {
    this._val_2 = v;
  }

  get value() {
    return this._value;
  }

  get duration(): number {
    return this._duration;
  }
  set duration(v: number) {
    this._duration = v;
  }

  get reverse(): boolean {
    return this._reverse;
  }
  set reverse(v: boolean) {
    this._reverse = v;
  }

  get ease_method(): IEaseMethod {
    return this._ease_method;
  }
  set ease_method(v: IEaseMethod) {
    this._ease_method = v;
  }
  get is_finish(): boolean {
    return this._time >= this._duration;
  }

  get time(): number {
    return this._time;
  }
  set time(v: number) {
    this._time = clamp(v, 0, this.duration);
  }

  constructor(begin = 0, end = 1, duration = 250, reverse = false) {
    this.set(begin, end, duration, reverse);
  }
  set(begin: number, end: number, duration: number, reverse: boolean): this {
    this._val_1 = Number.isNaN(begin) ? this._val_1 : begin;
    this._val_2 = Number.isNaN(end) ? this._val_2 : end;
    this._duration = Number.isNaN(duration) ? this._duration : duration;
    this._reverse = reverse;
    return this;
  }
  play(reverse = this._reverse) {
    this._reverse = reverse;
    this._time = 0;
    return this;
  }
  set_ease_method(v: IEaseMethod) {
    this._ease_method = v;
    return this;
  }
  end(reverse = this._reverse) {
    this._reverse = reverse;
    this._time = this._duration;
    this.calc();
    return this;
  }
  calc(): this {
    if (this._time >= this._duration) {
      this._value = this._reverse ? this._val_1 : this._val_2;
      return this;
    }
    const factor = clamp(
      this._reverse
        ? (this._duration - this._time) / this._duration
        : this._time / this._duration,
      0,
      1,
    );
    this._value = this._ease_method(factor, this._val_1, this._val_2);
    return this;
  }
  update(dt: number): this {
    this.time = this.time + dt;
    this.calc()
    return this;
  }
}
export default Easing;