import { clamp } from "../utils/math/clamp";
import { IAnimation } from "./IAnimation";
const { max } = Math;

export class Animation implements IAnimation {
  protected _value: number = 0;
  protected _time: number = 0;
  protected _duration: number = 0
  protected _reverse: boolean = false;
  protected _loop: number = 0;

  get loop(): number { return this._loop; }
  set loop(v: number) { this.set_loop(v) }
  set_loop(v: number): this {
    this._loop = v
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

  get reach_end(): boolean {
    const { reverse, time, duration } = this
    return reverse ? time >= duration : time <= 0;
  }
  get is_start(): boolean {
    const { reverse, time, duration } = this
    return reverse ? time <= 0 : time >= duration;
  }
  start(reverse: boolean = this.reverse): this {
    this.reverse = reverse;
    this.time = reverse ? this.duration : 0
    return this;
  }
  end(reverse: boolean = this.reverse): this {
    this.reverse = reverse;
    this.time = reverse ? 0 : this.duration
    return this;
  }
  calc(): this {
    this.value = this.duration === 0 ? this.value : this.time / this.duration;
    return this;
  }
  update(dt: number): this {
    const { duration, reverse, time, loop } = this
    let t = reverse ? time - dt : time + dt;
    if (loop) {
      if (reverse && t < 0 && duration > 0) {
        while (t < 0) t += duration
      } else if (!reverse && t > duration && duration > 0) {
        while (t > duration) t -= duration
      }
    }
    this.time = clamp(t, 0, duration);
    this.calc();
    return this;
  }
}
