import { IText } from "../../3d/IText";
import Invoker from "../../base/Invoker";
import { IBgData } from "../../defines";
import { Defines } from "../../defines/defines";
import Ditto from "../../ditto";
import Layout from "../Layout";
import { LayoutComponent } from "./LayoutComponent";

export default class BackgroundNameText extends LayoutComponent {
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
  protected _mesh: IText;
  protected _unmount_jobs = new Invoker();

  constructor(layout: Layout, f_name: string) {
    super(layout, f_name);
    this._mesh = new Ditto.TextNode(this.lf2)
      .set_center(0, 0.5)
      .set_name(BackgroundNameText.name)
      .set_style({
        fill_style: "#9b9bff",
        font: "14px Arial",
      });
  }

  override on_resume(): void {
    super.on_resume();

    this._background = this.backgrounds[0] ?? Defines.VOID_STAGE;

    this.layout.sprite.add(this._mesh);
    this._unmount_jobs.add(
      this.lf2.callbacks.add({
        on_broadcast: (v) => {
          if (v === Defines.BuiltIn_Broadcast.SwitchBackground)
            this.switch_background();
        },
      }),
      () => this._mesh.del_self(),
    );
    this._mesh.set_text(this.text).apply();
  }

  override on_pause(): void {
    super.on_pause();
    this._unmount_jobs.invoke_and_clear();
  }

  protected switch_background() {
    const { backgrounds } = this;
    const background_id = this.background.id;
    const idx =
      (backgrounds.findIndex((v) => v.id === background_id) + 1) %
      backgrounds.length;
    this._background = backgrounds[idx];
    this._mesh.set_text(this.text).apply();
  }
}
