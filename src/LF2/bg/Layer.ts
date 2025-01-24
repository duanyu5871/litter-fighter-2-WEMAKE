import { fade_in } from "../../Utils/fade_in";
import fade_out from "../../Utils/fade_out";
import type { IBgLayerInfo } from "../defines/IBgLayerInfo";
import Background from "./Background.js";
export class Layer {
  readonly bg: Background;
  readonly info: IBgLayerInfo;
  opacity = 0;
  visible = false;
  private _cancel_anim?: () => void;
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
  }
  fade_out(duration: number = 255, delay: number = 0): void {
    this._cancel_anim?.()
    this._cancel_anim = fade_out(o => this.opacity = o, duration, delay);
  }
  fade_in(duration: number = 255, delay: number = 0): void {
    this._cancel_anim?.()
    this._cancel_anim = fade_in(o => {
      this.opacity = o
    }, duration, delay);
  }
  dispose() {
  }
}

export default Layer;