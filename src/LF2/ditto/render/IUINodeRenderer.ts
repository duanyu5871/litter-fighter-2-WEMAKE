import type { ISprite } from "../../3d/ISprite";
import type { UINode } from "../../ui/UINode";

export interface IUINodeRenderer {
  /** @deprecated get rip of it */ sprite: ISprite;
  set x(v: number);
  set y(v: number);
  node: UINode;
  visible: boolean;
  parent: IUINodeRenderer;
  img_idx: number;
  on_start(): void;
  on_stop(): void;
  del(child: IUINodeRenderer): void;
  add(child: IUINodeRenderer): void;
  del_self(): void;
  render(): void;
}