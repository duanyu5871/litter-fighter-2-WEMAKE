import GamePrepareLogic from "./GamePrepareLogic";
import { UIComponent } from "./UIComponent";

export default class ComNumButton extends UIComponent {
  get gpl() {
    return this.node.root.search_component(GamePrepareLogic);
  }
  override on_click(): void {
    this.gpl?.set_com_num(this.num(0) || 0);
  }
  override on_show(): void {
    super.on_show?.();
    const { gpl } = this;
    const num = this.num(0) || 0
    if (!gpl) return;
    const { min_com_num, max_com_num } = gpl;
    this.node.disabled = num < min_com_num || num > max_com_num;
  }
}
