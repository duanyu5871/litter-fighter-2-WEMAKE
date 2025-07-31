import Invoker from "../../base/Invoker";
import GameKey from "../../defines/GameKey";
import { ui_load_txt } from "../ui_load_txt";
import { UIComponent } from "./UIComponent";

export default class PlayerKeyText extends UIComponent {
  get player_id() { return this.args[0] || ""; }
  get key_name() { return this.args[1] || ""; }
  get player() { return this.lf2.players.get(this.player_id); }
  get key_code() {
    const { player } = this;
    if (!player) return 'NOT SET'
    return player.keys[this.key_name as GameKey]
  }
  protected _unmount_jobs = new Invoker();
  override on_resume() {
    super.on_resume();
    this._unmount_jobs.add(
      this.player?.callbacks.add({
        on_key_changed: () => this.update_sprite(),
      }),
      () => this._on_cancel(),
    );
    this.update_sprite();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  private _on_cancel = () => {
    // this._sprite
    //   ?.set_style({ ...this._sprite.style, fill_style: "white" })
    //   .apply();
  };

  async update_sprite() {
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
