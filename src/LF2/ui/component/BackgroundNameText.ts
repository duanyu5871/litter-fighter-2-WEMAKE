import { IBgData } from "../../defines";
import { Defines } from "../../defines/defines";
import { ui_load_txt } from "../ui_load_txt";
import { UIComponent } from "./UIComponent";

export default class BackgroundNameText extends UIComponent {
  private _background: IBgData = Defines.VOID_BG;

  get backgrounds(): IBgData[] {
    return (
      this.lf2.datas.backgrounds?.filter((v) => v.id !== Defines.VOID_BG.id) ||
      []
    );
  }
  get background(): IBgData {
    return this._background;
  }
  get text(): string {
    return this._background.base.name;
  }
  override on_resume(): void {
    super.on_resume();
    if (this._background === Defines.VOID_BG) this.on_broadcast();
    this.lf2.callbacks.add(this)
  }
  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this);
  }
  on_broadcast(v: string = Defines.BuiltIn_Broadcast.SwitchBackground) {
    if (v !== Defines.BuiltIn_Broadcast.SwitchBackground) return;
    const { backgrounds } = this;
    if (!backgrounds.length) {
      this._background = Defines.VOID_BG
    } else {
      const background_id = this.background.id;
      const curr_idx = backgrounds.findIndex((v) => v.id === background_id)
      const next_idx = (curr_idx + 1) % backgrounds.length;
      this._background = backgrounds[next_idx]!;
    }
    ui_load_txt(this.lf2, {
      i18n: this.text, style: {
        fill_style: "#9b9bff",
        font: "15px Arial",
      }
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!
      this.node.size.value = [w / scale, h / scale];
    })
  }
}
