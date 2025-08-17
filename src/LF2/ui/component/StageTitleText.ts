import { Stage } from "../../stage";
import { ui_load_txt } from "../ui_load_txt";
import { UIComponent } from "./UIComponent";

export class StageTitleText extends UIComponent {
  static override readonly TAG = "StageTitleText"


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
    ui_load_txt(this.lf2, {
      i18n: title, style: {
        fill_style: "white",
        font: "12px Arial",
        line_width: 1,
      }
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!;
      this.node.size.value = [w / scale, h / scale];
    });
  }
}
