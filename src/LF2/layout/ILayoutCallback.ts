import Layout from "./Layout";


export interface ILayoutCallback {
  on_click?(): void;
  on_show?(layout: Layout): void;
  on_hide?(layout: Layout): void;
  on_foucs_changed?(layout: Layout): void;
  on_foucs_item_changed?(
    foucs: Layout | undefined,
    blur: Layout | undefined
  ): void;
}
