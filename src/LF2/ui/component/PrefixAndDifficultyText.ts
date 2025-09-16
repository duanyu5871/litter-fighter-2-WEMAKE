import { DifficultyNames } from "../../defines";
import { ILf2Callback } from "../../ILf2Callback";
import { ui_load_txt } from "../ui_load_txt";
import { UIComponent } from "./UIComponent";

export class PrefixAndDifficultyText extends UIComponent implements ILf2Callback {
  static override readonly TAG = "PrefixAndDifficultyText"
  private _prefix: string = '';

  override on_start(): void {
    super.on_start?.();
    this._prefix = this.str(0) ?? '';
  }

  override on_resume(): void {
    super.on_resume();
    this.lf2.callbacks.add(this)
    this.on_difficulty_changed()
  }
  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this)
  }
  on_difficulty_changed() {
    const title = `${this._prefix} (${DifficultyNames[this.lf2.difficulty]})`

    ui_load_txt(this.lf2, {
      i18n: title, style: {
        fill_style: "white",
        font: "12px Arial",
        line_width: 1,
        disposable: true
      }
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!;
      this.node.size.value = [w / scale, h / scale];
    });
  }
}
