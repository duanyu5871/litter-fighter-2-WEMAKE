import { clamp } from "../utils/math/clamp";
import { IAnimation } from "./IAnimation";
const { max } = Math;

export class Animation implements IAnimation {
  protected _value: number = 0;
  protected _time: number = 0;
  protected _duration: number = 0
  protected _reverse: boolean = false;
  protected _times: number = 1;
  protected _stay_end: number = 1;
  protected _curr_times: number = 0;

  get curr_times(): number { return this._curr_times; }
  set curr_times(v: number) { this.set_curr_times(v) }
  set_curr_times(v: number): this {
    this._curr_times = v
    return this
  }

  stay_end(v: any = true) {
    this._stay_end = v ? 1 : 0
    return this
  }

  get times(): number { return this._times; }
  set times(v: number) { this.set_times(v) }
  set_times(v: number): this {
    this._times = v
    return this
  }
  get reverse(): boolean { return this._reverse; }
  set reverse(v: boolean) { this.set_reverse(v) }
  set_reverse(v: boolean): this {
    this._reverse = v
    return this
  }

  get duration(): number { return this._duration; }
  set duration(v: number) { this.set_duration(v) }
  set_duration(v: number): this {
    this._duration = max(0, v);
    this._time = clamp(this._time, 0, this._duration)
    return this
  }

  get value(): number { return this._value; }
  set value(v: number) { this.set_value(v) }
  set_value(v: number): this { this._value = v; return this }

  get time(): number { return this._time; }
  set time(v: number) { this.set_time(v); }
  set_time(v: number): this { this._time = clamp(v, 0, this.duration); return this }

  get is_end(): boolean {
    const { times, curr_times } = this
    return times > 0 && curr_times >= times;
  }
  start(reverse: boolean = this.reverse): this {
    this.curr_times = 0;
    this.reverse = reverse;
    this.time = reverse ? this.duration : 0
    return this;
  }
  end(reverse: boolean = this.reverse): this {
    this.curr_times = this._times;
    this.reverse = reverse;
    this.time = reverse ? 0 : this.duration
    return this;
  }
  calc(): this {
    this.value = this.duration === 0 ? this.value : this.time / this.duration;
    return this;
  }
  update(dt: number): this {
    const { times, curr_times } = this
    if (times > 0 && curr_times >= times) return this;
    
    const { duration, reverse, time, } = this
    let t = reverse ? time - dt : time + dt;
    if (times < 0 || curr_times < times) {
      if (reverse && t < 0 && duration > 0) {
        while (t < 0) {
          t += duration
          ++this.curr_times
        }
      } else if (!reverse && t > duration && duration > 0) {
        while (t > duration) {
          t -= duration
          ++this.curr_times
        }
      }
      if (times > 0 && curr_times >= times && this._stay_end) {
        t = reverse ? 0 : duration;
      }
    }
    this.time = clamp(t, 0, duration);
    this.calc();
    return this;
  }
}
