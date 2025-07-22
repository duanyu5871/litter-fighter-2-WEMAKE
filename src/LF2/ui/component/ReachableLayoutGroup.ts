import GameKey from "../../defines/GameKey";
import type { UINode } from "../UINode";
import { UIComponent } from "./UIComponent";

export class ReachableLayoutGroup extends UIComponent {
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

  override on_player_key_down(_player_id: string, key: GameKey): void {
    if (!this.binded_layout.global_visible) return;
    if (this.binded_layout.global_disabled) return;
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
    const items = this.node.root.search_components(ReachableLayout, (v) => {
      return (
        v.group_name === this.name &&
        v.node.global_visible &&
        !v.node.global_disabled
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

export class ReachableLayout extends UIComponent {
  get group_name(): string {
    return this.args[0] || '';
  }
  get group(): ReachableLayoutGroup | undefined {
    return this.node.root.find_component(
      ReachableLayoutGroup,
      (v) => v.name === this.group_name,
    );
  }
}
