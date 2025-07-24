import { Animation } from "./Animation";
export class Sequence extends Animation {
  static override TAG = 'Sequence';
  readonly anims: Animation[] = [];
  constructor(...anims: Animation[]) {
    super()
    this.anims = anims
    this.duration = anims.reduce((r, i) => r + i.duration, 0)
  }
  override calc(): this {
    let { time, reverse: reverse, duration, anims } = this;
    if (time >= duration) {
      const a = this.anims[this.anims.length - 1]
      a.time = a.duration;
      this.value = a.calc().value;
      return this;
    }
    if (time <= 0) {
      const a = this.anims[0]
      a.time = 0;
      this.value = a.calc().value;
      return this;
    }
    const len = anims.length
    if (reverse) {
      let idx = len - 1
      for (; idx >= 0; --idx) {
        if (this.__debugging) console.log(`[${Sequence.TAG}::calc] anim idx=${idx}`)
        const anim = anims[idx]!;
        duration -= anim.duration;
        if (time > duration) {
          anim.time = time - duration;
          this.value = anim.calc().value;
          break;
        }
      }
      if (this.__debugging) console.log(`[${Sequence.TAG}::calc] anim idx=${idx}, value=${anims[idx].value}`)
    } else {
      let idx = 0
      for (; idx < len; ++idx) {
        if (this.__debugging) console.log(`[${Sequence.TAG}::calc] anim idx=${idx}`)
        const anim = anims[idx]!;
        if (anim.duration > time) {
          anim.time = time;
          this.value = anim.calc().value;
          break;
        }
        time -= anim.duration;
      }
      if (this.__debugging) console.log(`[${Sequence.TAG}::calc] anim idx=${idx}, value=${anims[idx].value}`)
    }
    return this;
  }
}
export default Sequence;