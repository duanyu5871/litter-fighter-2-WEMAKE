import type UINode from "./UINode";
export interface ILayoutCallback {
  on_click?(): void;
  on_show?(layout: UINode): void;
  on_hide?(layout: UINode): void;
  on_foucs_changed?(layout: UINode): void;
  on_foucs_item_changed?(
    foucs: UINode | undefined,
    blur: UINode | undefined
  ): void;
}
