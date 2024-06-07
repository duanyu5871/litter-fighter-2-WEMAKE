import Text from "../../3d/Text";
import { LayoutComponent } from "./LayoutComponent";

export class PlayingTimeText extends LayoutComponent {
  private _txt?: Text;
  private _start_time: number = 0;

  override on_start(): void {
    super.on_start?.();
    this._start_time = Date.now();
    this.layout.sprite.add(
      this._txt = new Text(this.lf2)
        .set_center(0.5, 0.5)
        .apply()
    )
  }

  override on_stop(): void {
    super.on_stop?.();
    this._txt?.del_self()
  }

  override on_show(): void {
    super.on_show?.();
    this._txt
      ?.set_style(this.layout.style)
      .set_text(this.get_txt())
      .apply()
  }


  protected get_txt(): string {
    const ms = Date.now() - this._start_time;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / (60 * 1000)) % 60;
    const h = Math.floor(ms / (60 * 60 * 1000)) % 60;
    let ret = '';
    if (h) ret += h + ':';
    if (m > 9 || !h) ret += m + ':';
    else ret += '0' + m + ':'
    if (s > 9) ret += s;
    else ret += '0' + s;
    return ret;
  }
}

