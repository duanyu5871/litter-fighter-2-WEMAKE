import { IText } from "../../3d/IText";
import Ditto from "../../ditto";
import { Component } from "./Component";

export class PlayingTimeText extends Component {
  private _txt?: IText;

  override on_start(): void {
    super.on_start?.();
    this.node.sprite.add(
      (this._txt = new Ditto.TextNode(this.lf2).set_center(0.5, 0.5).apply()),
    );
  }

  override on_stop(): void {
    super.on_stop?.();
    this._txt?.del_self();
  }

  override on_show(): void {
    super.on_show?.();
    this._txt?.set_style(this.node.style).set_text(this.get_txt()).apply();
  }

  protected get_txt(): string {
    const ms = (this.world.stage.time * 1000) / 60;
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / (60 * 1000)) % 60;
    const h = Math.floor(ms / (60 * 60 * 1000)) % 60;
    let ret = "";
    if (h) ret += h + ":";
    if (m > 9 || !h) ret += m + ":";
    else ret += "0" + m + ":";
    if (s > 9) ret += s;
    else ret += "0" + s;
    return ret;
  }

  // on_render(dt: number): void {
  //   this._txt?.set_text(this.get_txt()).apply()
  // }
}
