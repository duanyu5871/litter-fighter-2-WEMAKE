import { Stage } from "../../stage";
import { UITextLoader } from "../UITextLoader";
import { UIComponent } from "./UIComponent";

export class StageTitleText extends UIComponent {
  static override readonly TAG = "StageTitleText"
  private _text_loader = new UITextLoader(() => this.node).set_style({
    fill_style: "white",
    font: "12px Arial",
    line_width: 1,
    padding_t: 2
  }).ignore_out_of_date();

  override on_start(): void {
    super.on_start?.();
    this.on_stage_change(this.world.stage)
  }

  override on_resume(): void {
    super.on_resume();
    this.world.callbacks.add(this)
  }
  override on_pause(): void {
    super.on_pause();
    this.world.callbacks.del(this)
  }
  on_stage_change(stage: Stage) {
    const title = stage.data.title ?? stage.bg.name ?? ""
    this._text_loader.set_text([title]);
  }
}
