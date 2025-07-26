import { Animation } from "./Animation";
import { Delay } from "./Delay";
import Easing from "./Easing";
export class Sequence extends Animation {
  static override TAG = 'Sequence';

  private _curr_anim: Animation | null = null;

  readonly anims: Animation[] = [];

  get curr_anim(): Animation | null { return this._curr_anim }

  constructor(...anims: Animation[]) {
    super()
    this.anims = anims
    this.duration = anims.reduce((r, i) => r + i.duration, 0);
    this.start()
  }

  override start(reverse?: boolean): this {
    super.start(reverse);
    this._curr_anim = this.anims[reverse ? this.anims.length - 1 : 0] || null
    return this
  }

  override end(reverse?: boolean): this {
    super.end(reverse)
    this._curr_anim = this.anims[reverse ? 0 : this.anims.length - 1] || null
    return this;
  }

  override calc(): this {
    let { time, reverse, duration, anims } = this;
    if (time >= duration) {
      const a = this.anims[this.anims.length - 1]
      this._curr_anim = a;
      a.time = a.duration;
      this.value = a.calc().value;
      return this;
    }
    if (time <= 0) {
      const a = this.anims[0]
      this._curr_anim = a;
      a.time = 0;
      this.value = a.calc().value;
      return this;
    }
    const len = anims.length
    if (reverse) {
      let idx = len - 1
      for (; idx >= 0; --idx) {
        this.debug(`calc`, `anim idx=${idx}`)
        const anim = anims[idx]!;
        duration -= anim.duration;
        if (time > duration) {
          anim.time = time - duration;
          this.value = anim.calc().value;
          this._curr_anim = anim
          break;
        }
      }
      this.debug(`calc`, `anim idx=${idx}, value=${anims[idx].value}`)
    } else {
      let idx = 0
      for (; idx < len; ++idx) {
        this.debug(`calc`, `anim idx=${idx}`)
        const anim = anims[idx]!;
        if (anim.duration > time) {
          anim.time = time;
          this.value = anim.calc().value;
          this._curr_anim = anim
          break;
        }
        time -= anim.duration;
      }
      this.debug(`calc`, `anim idx=${idx}, value=${anims[idx].value}`)
    }
    return this;
  }
}

  const anim = new Sequence(
    new Delay(0, 1000),
    new Easing(0, 1).set_duration(1000),
    new Delay(1, 250),
  ).set_times(2).set_reverse(true)
  anim.start()
  anim.update(2000);
  anim.update(250);
  anim.update(500);
  anim.update(1500);
  anim.update(249);
  anim.update(1);