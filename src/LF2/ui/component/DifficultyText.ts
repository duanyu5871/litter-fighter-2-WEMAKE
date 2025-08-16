import { Defines } from "../../defines/defines";
import { ui_load_txt } from "../ui_load_txt";
import { UIComponent } from "./UIComponent";

export default class DifficultyText extends UIComponent {
  static override TAG: string = "difficulty_text";
  protected get text(): string {
    return this.lf2.string(Defines.DifficultyLabels[this.lf2.difficulty]);
  }
  override on_resume(): void {
    super.on_resume();
    this.lf2.callbacks.add(this);
    this.on_difficulty_changed();
  }
  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this);
  }
  on_difficulty_changed() {
    ui_load_txt(this.lf2, {
      i18n: this.text, 
      style: {
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
