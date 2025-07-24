import { Delay, Easing, IAnimation, Sequence } from "../animation";
import type { IBgLayerInfo } from "../defines/IBgLayerInfo";
import type Background from "./Background";
export class Layer {
  readonly bg: Background;
  readonly info: IBgLayerInfo;
  private _fade_anim?: IAnimation;
  opacity = 0;
  visible = false;
  constructor(bg: Background, info: IBgLayerInfo) {
    this.bg = bg;
    this.info = info;
  }
  update(count: number) {
    const { info: { c1, c2, cc } } = this;
    if (cc !== void 0 && c1 !== void 0 && c2 !== void 0) {
      const now = count % cc;
      this.visible = now >= c1 && now <= c2;
    } else {
      this.visible = true;
    }
    if (this._fade_anim) {
      this._fade_anim.time++;
      this.opacity = this._fade_anim.calc().value
      if (this._fade_anim.time >= this._fade_anim.duration)
        this._fade_anim = void 0;
    }
  }
  fade_out(duration: number = 16, delay: number = 0): void {
    this._fade_anim = new Sequence(new Delay(this.opacity, delay), new Easing(this.opacity, 0).set_duration(duration))
  }
  fade_in(duration: number = 16, delay: number = 0): void {
    this._fade_anim = new Sequence(new Delay(this.opacity, delay), new Easing(this.opacity, 1).set_duration(duration))
  }
  dispose() {
  }
}

export default Layer;