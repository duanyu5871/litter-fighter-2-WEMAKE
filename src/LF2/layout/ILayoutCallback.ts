import Node from "./Node";


export interface ILayoutCallback {
  on_click?(): void;
  on_show?(layout: Node): void;
  on_hide?(layout: Node): void;
  on_foucs_changed?(layout: Node): void;
  on_foucs_item_changed?(
    foucs: Node | undefined,
    blur: Node | undefined
  ): void;
}
