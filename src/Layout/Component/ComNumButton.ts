import GamePrepareLogic from "./GamePrepareLogic";
import { LayoutComponent } from "./LayoutComponent";

export default class ComNumButton extends LayoutComponent {
  get num(): number { return Number(this.args[0] || '') }
  get gpl() { return this.layout.root.search_component(GamePrepareLogic) }
  on_click(): void {
    this.gpl?.set_com_num(this.num);
  }
  override on_show(): void {
    super.on_show?.()
    const { gpl, num } = this;
    if (!gpl) return;
    const { min_com_num, max_com_num } = gpl;
    this.layout.disabled = num < min_com_num || num >= max_com_num;
  }
}
