import { clamp } from '../clamp';
import { is_num } from '../is_num';
interface IChildAnimation {
  get value(): number;
  get duration(): number;
  get reverse(): boolean;
  set reverse(v: boolean);
  set time(v: number);
  calc(): this;
  end(reverse?: boolean): void;
}
class Delay implements IChildAnimation {
  duration: number;
  time: number = 0;
  reverse: boolean = false;
  owner: SequenceAnimation;
  get value(): number { return this.owner.value };
  constructor(owner: SequenceAnimation, duration: number) {
    this.owner = owner;
    this.duration = duration;
  }
  calc(): this { return this }
  end(): void { }
}

export default class SequenceAnimation {
  protected _anims: IChildAnimation[] = [];
  protected _r_anims: IChildAnimation[] = [];
  protected _reverse = false;
  protected _time: number = 0;
  protected _duration: number = 0;
  protected _value: number = 0;

  get value(): number { return this._value; }
  get is_finish(): boolean { return this._time >= this._duration; }

  get reverse(): boolean { return this._reverse; }
  set reverse(v: boolean) { this._reverse = v; }

  get time(): number { return this._time; }
  set time(v: number) { this._time = clamp(v, 0, this._duration); }

  constructor(...animations: (IChildAnimation | number)[]) {
    for (const a of animations) {
      const anim = is_num(a) ? new Delay(this, a) : a;
      this._anims.push(anim);
      this._r_anims.unshift(anim);
      this._duration += anim.duration;
    };
    this.calc();
  }

  play(reverse: boolean = this._reverse) {
    this._reverse = reverse;
    this._time = 0;
    this.calc();
    return this;
  }

  end(reverse: boolean = this._reverse) {
    this._reverse = reverse;
    this._time = this._duration;
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
