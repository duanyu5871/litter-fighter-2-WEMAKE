import { is_num } from "../utils";
import { Animation } from "./Animation";
import { Delay } from "./Delay";
export class Sequence extends Animation {
  protected _anims: Animation[] = [];
  protected _r_anims: Animation[] = [];
  constructor(...animations: (Animation | number)[]) {
    super()
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
    this.duration = this._anims.reduce((r, i) => r + i.duration, 0)
  }

  override calc(): this {
    let { time, reverse, duration } = this;
    if (reverse) {
      for (const a of this._r_anims) {
        a.reverse = reverse
        duration -= a.duration;
        if (time > duration) {
          a.time = a.duration - time + duration;
          this._value = a.calc().value;
          break;
        } else {
          time -= a.duration;
          a.time = 0;
          this._value = a.calc().value;
        }
      }
    } else {
      for (const a of this._anims) {
        a.reverse = reverse
        if (a.duration > time) {
          a.time = time;
          this._value = a.calc().value;
          break;
        } else {
          time -= a.duration;
          a.time = a.duration;
          this._value = a.calc().value;
        }
      }
    }
    return this;
  }
}
export default Sequence;