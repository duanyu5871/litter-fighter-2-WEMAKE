import { floor } from "../../utils";
import { ui_load_txt } from "../ui_load_txt";
import { UIComponent } from "./UIComponent";

export class PlayingTimeText extends UIComponent {

  override on_show(): void {
    ui_load_txt(this.lf2, {
      i18n: this.get_txt(), style: this.node.style
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!
      this.node.size.value = [w / scale, h / scale];
    })
  }

  protected get_txt(): string {
    const ms = (this.world.stage.time * 1000) / 60;
    const s = floor(ms / 1000) % 60;
    const m = floor(ms / (60 * 1000)) % 60;
    const h = floor(ms / (60 * 60 * 1000)) % 60;
    let ret = "";
    if (h) ret += h + ":";
    if (m > 9 || !h) ret += m + ":";
    else ret += "0" + m + ":";
    if (s > 9) ret += s;
    else ret += "0" + s;
    return ret;
  }
}
