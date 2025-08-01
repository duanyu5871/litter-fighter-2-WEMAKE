import Invoker from "../../base/Invoker";
import { Defines } from "../../defines";
import GameKey from "../../defines/GameKey";
import { ui_load_txt } from "../ui_load_txt";
import { UIComponent } from "./UIComponent";

export class PlayerKeyText extends UIComponent {
  static override TAG: string = 'PlayerKeyText';
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
    ui_load_txt(this.lf2, {
      value: this.key_code, style: {
        fill_style: "#9b9bff",
        font: "14px Arial",
      }
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!
      this.node.size.value = [w / scale, h / scale];
    })
  }
}
