import fade_out from "../../Utils/fade_out";
import { IBgLayerInfo } from "../defines/IBgLayerInfo";
import Background from "./Background";
export class Layer {
  readonly bg: Background;
  readonly info: IBgLayerInfo;
  opacity = 0;
  visible = false;

  constructor(bg: Background, info: IBgLayerInfo) {
    this.bg = bg;
    this.info = info;
  }
  update(count: number) {
    this.opacity = Math.max(1, 0.1);
    const { info: { c1, c2, cc } } = this;
    if (cc !== void 0 && c1 !== void 0 && c2 !== void 0) {
      const now = count % cc;
      this.visible = now >= c1 && now <= c2;
    } else {
      this.visible = true;
    }
  }

  fade_out(duration: number, delay: number = 0): void {
    fade_out((o) => this.opacity = o, duration, delay);
  }
}

export default Layer;