import { ui_load_txt } from "../ui_load_txt";
import factory from "./Factory";
import { FadeOutOpacity } from "./FadeOutOpacity";
import { UIComponent } from "./UIComponent";

export class LoadingContentText extends UIComponent {
  static override TAG = "LoadingContentText"

  get fade_out_duration() { return this.num(1) ?? 0 };
  get fade_out_delay() { return this.num(2) ?? 0 }
  protected fadeout?: FadeOutOpacity;

  override init(...args: any[]): this {
    super.init(...args);
    if (this.fade_out_duration) {
      const expression = FadeOutOpacity.expression(
        this.fade_out_duration,
        this.fade_out_delay
      ).done()
      this.fadeout = factory.create(this.node, expression)[0] as FadeOutOpacity
      this.fadeout.__debugging = true;
      console.log(expression, this.fadeout)
      this.node.components.add(this.fadeout)
    }
    return this;
  }

  override on_resume(): void {
    super.on_resume();
    this.lf2.callbacks.add(this);
  }

  override on_pause(): void {
    super.on_pause();
    this.lf2.callbacks.del(this);
  }

  on_loading_end() {
    const page = this.str(0)
    if (page) this.lf2.set_ui(page)
  }

  on_loading_content(text: string, progress: number) {
    this.fadeout?.start();
    const str = progress ? `loading: ${text}(${progress}%)` : ` loading: ${text}`;
    ui_load_txt(this.lf2, {
      value: str, style: this.node.style
    }).then(v => {
      this.node.txts.value = v;
      this.node.txt_idx.value = 0;
      const { w, h, scale } = v[0]!
      this.node.size.value = [w / scale, h / scale];
    })
  }
}
