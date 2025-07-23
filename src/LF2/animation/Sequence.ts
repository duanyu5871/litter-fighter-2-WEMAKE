import { clamp, is_num } from "../utils";
import { Delay } from "./Delay";
import { IAnimation } from "./IAnimation";
export class Sequence implements IAnimation {
  protected _anims: IAnimation[] = [];
  protected _r_anims: IAnimation[] = [];
  protected _reverse = false;
  protected _time: number = 0;
  protected _value: number = 0;
  get value(): number {
    return this._value;
  }
  get is_end(): boolean {
    return this._reverse ? this._time <= 0 : this._time >= this.duration;
  }
  get is_begin(): boolean {
    return this._reverse ? this._time >= this.duration : this._time <= 0;
  }
  get reverse(): boolean {
    return this._reverse;
  }
  set reverse(v: boolean) {
    this._reverse = v;
  }
  get time(): number {
    return this._time;
  }
  set time(v: number) {
    this._time = clamp(v, 0, this.duration);
  }

  constructor(...animations: (IAnimation | number)[]) {
    for (const a of animations) {
      if (is_num(a)) {
        if (a <= 0) continue;
        const anim = new Delay(this, a);
        this._anims.push(anim);
        this._r_anims.unshift(anim);
      } else {
        this._anims.push(a);
        this._r_anims.unshift(a);
      }
    }
    this.calc();
  }
  get duration(): number {
    return this._anims.reduce((r, i) => r + i.duration, 0)
  }

  play(reverse: boolean = this._reverse) {
    this._reverse = reverse;
    this._time = 0;
    this.calc();
    return this;
  }

  end(reverse: boolean = this._reverse): this {
    this._reverse = reverse;
    this._time = this.duration;
    this.calc();
    return this;
  }

  calc(): this {
    let time = this._time;
    const anims = this._reverse ? this._r_anims : this._anims
    for (const a of anims) {
      a.reverse = this._reverse;
      if (a.duration > time) {
        a.time = time;
        this._value = a.calc().value;
        break;
      }
      time -= a.duration;
      a.end(this._reverse);
      this._value = a.calc().value;
    }
    return this;
  }

  update(dt: number): this {
    if (this._reverse) {
      this.time -= dt;
    } else {
      this.time += dt;
    }
    this.calc()
    return this;
  }
}
export default Sequence;