import { UIComponent } from "./UIComponent";

export class DanmuGameLogic extends UIComponent {
  static override readonly TAG = 'DanmuGameLogic';
  override on_start(): void {
    super.on_start?.();
    const bg_data = this.lf2.random_get(this.lf2.datas.backgrounds);
    if (bg_data) this.lf2.change_bg(bg_data);
  }

  override on_show(): void { }
}
