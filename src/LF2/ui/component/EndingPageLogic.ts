import { IUIPointerEvent } from "../IUIPointerEvent";
import { UINode } from "../UINode";
import { IJalousieCallbacks, Jalousie } from "./Jalousie";
import { UIComponent } from "./UIComponent";

export class EndingPageLogic extends UIComponent {
  static override readonly TAG: string = `EndingPageLogic`;
  jalousie: Jalousie | undefined;
  txt_node: UINode | undefined;
  jalousie_cbs: IJalousieCallbacks = {
    on_anim_end: (j) => this.on_jalousie_anim_end(j)
  }
  override on_start(): void {
    super.on_start?.();
    this.jalousie = this.node.search_component(Jalousie);
    this.jalousie?.callbacks.add(this.jalousie_cbs)
    this.txt_node = this.node.search_child('txt_b')
  }
  override on_stop(): void {
    super.on_stop?.();
    this.jalousie?.callbacks.del(this.jalousie_cbs)
  }

  override on_click(e: IUIPointerEvent): void {
    if (this.jalousie) this.jalousie.open = !this.jalousie.open
  }
  on_jalousie_anim_end(j: Jalousie): void {
    if (j.open) return;

    if (this.txt_node) {
      const i = this.txt_node.txt_idx.value++
      const l = this.txt_node.txts.value.length;
      if (i < l - 1) this.txt_node.txt_idx.value = i + 1;
      else this.lf2.pop_ui(false, (_, i) => i === 0)
    }
    j.open = true;
  }
}
