import GameKey from "../../defines/GameKey";
import { IUIKeyEvent } from "../IUIKeyEvent";
import type { UINode } from "../UINode";
import { Reachable } from "./Reachable";
import { UIComponent } from "./UIComponent";

export class ReachableGroup extends UIComponent {
  static override readonly TAG = 'ReachableGroup'
  get name(): string {
    return this.args[0] || "";
  }
  get direction(): string {
    return this.args[1] || "";
  }
  get binded_layout(): UINode {
    const lid = this.args[2];
    if (!lid) return this.node;
    return this.node.root.find_child(lid) || this.node;
  }
  override on_key_down(e: IUIKeyEvent): void {
    const { key } = e;
    if (!this.binded_layout.visible) return;
    if (this.binded_layout.disabled) return;
    switch (this.direction) {
      case "lr":
        if (key === "L" || key === "R") break;
        else return;
      case "ud":
        if (key === "U" || key === "D") break;
        else return;
      default:
        return;
    }
    const items = this.node.root.search_components(Reachable, (v) => {
      return (
        v.group_name === this.name &&
        v.node.visible &&
        !v.node.disabled
      );
    });
    if (items.length <= 0) return;

    if (this.direction === "lr")
      items.sort((a, b) => a.node.x_on_root - b.node.x_on_root);
    else if (this.direction === "ud")
      items.sort((a, b) => a.node.y_on_root - b.node.y_on_root);

    const focused_layout = this.node.focused_node;

    if (key === "L" || key === "U") {
      const idx = items.findIndex((v) => v.node === focused_layout);
      const next_idx = (Math.max(idx, 0) + items.length - 1) % items.length;
      items[next_idx]!.node.focused = true;
    } else if (key === "R" || key === "D") {
      const idx = items.findIndex((v) => v.node === focused_layout);
      const next_idx = (idx + 1) % items.length;
      items[next_idx]!.node.focused = true;
    }
  }
}
