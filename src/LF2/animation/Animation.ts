import { clamp } from "../utils/math/clamp";
import { IAnimation } from "./IAnimation";
const { max } = Math;

export class Animation implements IAnimation {
  protected _value: number = 0;
  protected _time: number = 0;
  protected _duration: number = 0
  protected _reverse: boolean = false;
  protected _loop: boolean = false;

  get loop(): boolean { return this._loop; }
  set loop(v: boolean) { this.set_loop(v) }
  set_loop(v: boolean): this {
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

  get is_finish(): boolean {
    return this._reverse ? this._time >= this._duration : this._time <= 0;
  }
  play(reverse: boolean = this._reverse): this {
    this._reverse = reverse;
    this._time = 0;
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
    const t = this.reverse ? this.time - dt : this.time + dt;
    this.time = clamp(t, 0, this.duration);
    this.calc();
    return this;
  }
}
