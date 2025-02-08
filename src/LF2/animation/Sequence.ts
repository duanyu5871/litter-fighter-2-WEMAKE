import { clamp, is_num } from "../utils";
import { Delay } from "./Delay";
import { IBase } from "./IBase";
export class Sequence implements IBase {
  protected _anims: IBase[] = [];
  protected _r_anims: IBase[] = [];
  protected _reverse = false;
  protected _time: number = 0;
  protected _value: number = 0;

  get value(): number {
    return this._value;
  }
  get is_finish(): boolean {
    return this._time >= this.duration;
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

  constructor(...animations: (IBase | number)[]) {
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

  end(reverse: boolean = this._reverse) {
    this._reverse = reverse;
    this._time = this.duration;
    this.calc();
    return this;
  }

  calc(): this {
    let time = this._time;
    for (const a of this._reverse ? this._r_anims : this._anims) {
      a.reverse = this._reverse;
      if (a.duration > time) {
        a.time = time;
        this._value = a.calc().value;
        break;
      } else {
        time -= a.duration;
        a.end(this._reverse);
      }
    }
    return this;
  }

  update(dt: number): number {
    this.time = this.time + dt;
    return this.calc().value;
  }
}
export default Sequence;