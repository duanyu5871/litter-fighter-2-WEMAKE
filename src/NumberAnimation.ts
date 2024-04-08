import { IEaseMethod } from './LF2/ease_method/IEaseMethod';
import ease_in_out_sine from './LF2/ease_method/ease_in_out_sine';

export class NumberAnimation {
  protected _val_1 = 0;
  protected _val_2 = 1;
  protected _duration = 250;
  protected _reverse = false;

  protected _time = 0;
  protected _ease_method: IEaseMethod = ease_in_out_sine;

  get val_1() { return this._val_1; };
  get val_2() { return this._val_2; };
  get duration() { return this._duration; };
  get reverse() { return this._reverse; };
  get ease_method(): IEaseMethod { return this._ease_method; }
  set ease_method(v: IEaseMethod) { this._ease_method = v; }

  constructor(begin = 0, end = 1, duration = 250, reverse = false) {
    this.set(begin, end, duration, reverse)
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
  set_value(v: number) {
    const min = Math.min(this._val_1, this._val_2);
    const max = Math.max(this._val_1, this._val_2);
    if (v < min) v = min;
    if (v > max) v = max;
    const f = this._reverse ?
      this._ease_method.backward(v, this._val_2, this._val_1) :
      this._ease_method.backward(v, this._val_1, this._val_2);
    this._time = f * this._duration;
    return this;
  }
  end(reverse = this._reverse) {
    this._reverse = reverse;
    this._time = this._duration;
    return this;
  }
  update(dt: number) {
    if (this._time >= this._duration) {
      this._time = this._duration;
      if (this._reverse) return this._val_1;
      else return this._val_2;
    } else {
      const factor = Math.min(1, (this._time / this._duration));
      this._time += dt;
      return this._reverse ?
        this._ease_method(factor, this._val_2, this._val_1) :
        this._ease_method(factor, this._val_1, this._val_2);
    }
  }
}
