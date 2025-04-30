import { IText } from "../../3d/IText";
import Invoker from "../../base/Invoker";
import Ditto from "../../ditto";
import Layout from "../Node";
import { Component } from "./Component";

export default class LoadingFileNameDisplayer extends Component {
  protected _unmount_job = new Invoker();
  protected _mesh: IText;

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name);
    this._mesh = new Ditto.TextNode(this.lf2)
      .set_position(0, 0, 1)
      .set_center(...this.node.center)
      .set_style(this.node.style)
      .set_name(LoadingFileNameDisplayer.name)
      .apply();
  }

  override on_resume(): void {
    super.on_resume();
    this.node.sprite.add(this._mesh);
    this._unmount_job.add(
      () => this._mesh?.del_self(),
      this.lf2.callbacks.add({
        on_loading_content: (content, progress) =>
          this.update_sprite(content, progress),
        on_loading_end: (): void => this.lf2.set_layout("main_page"),
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
    this._mesh.set_text(str).apply();
  }
}
