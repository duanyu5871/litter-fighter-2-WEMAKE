import type { ISprite } from "../../3d/ISprite";
import type { UINode } from "../../ui/UINode";

export interface IUINodeRenderer {
  __debugging?: boolean;
  /** @deprecated get rip of it */ sprite: ISprite;
  set x(v: number);
  set y(v: number);
  node: UINode;
  visible: boolean;
  parent: IUINodeRenderer;
  img_idx: number;
  del(child: IUINodeRenderer): void;
  add(child: IUINodeRenderer): void;
  del_self(): void;
  render(): void;

  on_start?(): void;
  on_resume(): void;
  on_show?(): void;
  on_hide?(): void;
  on_pause?(): void;
  on_stop?(): void;
  on_foucs?(): void;
  on_blur?(): void;
}