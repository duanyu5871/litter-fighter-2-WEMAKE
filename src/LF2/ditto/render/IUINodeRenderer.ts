import type { ISprite } from "../../3d/ISprite";
import type { UINode } from "../../layout/UINode";

export interface IUINodeRenderer {
  /** @deprecated get rip of it */ sprite: ISprite;
  node: UINode;
  visible: boolean;
  parent: typeof this;
  img_idx: number;
  on_start(): void;
  on_stop(): void;
  del(child: typeof this): void;
  add(child: typeof this): void;
  del_self(): void;
  render(): void;
}