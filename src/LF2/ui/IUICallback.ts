import { UIComponent } from "./component/UIComponent";
import type { UINode } from "./UINode";
export interface IUICallback {
  on_click?(): void;
  on_show?(node: UINode): void;
  on_hide?(node: UINode): void;
  on_foucs_changed?(node: UINode): void;
  on_foucs_item_changed?(
    foucs: UINode | undefined,
    blur: UINode | undefined
  ): void;
  on_component_add?(component: UIComponent, node: UINode): void;
  on_component_del?(component: UIComponent, node: UINode): void;
}
