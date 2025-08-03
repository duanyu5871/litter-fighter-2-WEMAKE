import Invoker from "../../base/Invoker";
import { ui_load_txt } from "../ui_load_txt";
import type { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";

export default class LoadingFileNameDisplayer extends UIComponent {
  protected _unmount_job = new Invoker();

  constructor(node: UINode, f_name: string) {
    super(node, f_name);

  }

  override on_resume(): void {
    super.on_resume();
    this._unmount_job.add(
      this.lf2.callbacks.add({
        on_loading_content: (content, progress) => this.update_sprite(content, progress),
        on_loading_end: (): void => this.lf2.set_ui("main_page"),
      }),
    );
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_job.invoke();
    this._unmount_job.clear();
  }

  protected async update_sprite(text: string, progress: number) {
    const str = progress ? `${text}(${progress}%)` : text;
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
