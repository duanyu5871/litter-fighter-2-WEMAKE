import { Defines } from "../../defines/defines";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export default class DifficultyText extends UIComponent {
  static override readonly TAG: string = "difficulty_text";
  private _text_loader = new UITextLoader(() => this.node).set_style({
    fill_style: "#9b9bff",
    font: "15px Arial",
  }).ignore_out_of_date();

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
    this._text_loader.set_text([this.text])
  }
}
