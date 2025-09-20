import { Defines } from "../../defines";
import { GameKey } from "../../defines/GameKey";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class PlayerKeyText extends UIComponent {
  static override readonly TAG: string = 'PlayerKeyText';
  private _text_loader = new UITextLoader(() => this.node).set_style({
    fill_style: "#9b9bff",
    font: "14px Arial",
  }).ignore_out_of_date();

  get player_id() { return this.args[0] || this.node.find_parent(v => v.data.values?.player_id)?.data.values?.player_id || ''; }
  get key_name() { return this.args[1] || ""; }
  get player() { return this.lf2.players.get(this.player_id); }
  get key_code() {
    const { player } = this;
    if (!player) return 'NOT SET'
    const kc = player.keys[this.key_name as GameKey]?.toUpperCase();
    return Defines.SHORT_KEY_CODES[kc] || kc || 'NOT SET'
  }
  override on_resume() {
    super.on_resume();
    this.player?.callbacks.add(this)
    this.on_key_changed();
  }
  override on_pause(): void {
    super.on_pause();
    this.player?.callbacks.del(this)
  }
  on_key_changed() {
    this._text_loader.set_text([this.key_code])
  }
}
