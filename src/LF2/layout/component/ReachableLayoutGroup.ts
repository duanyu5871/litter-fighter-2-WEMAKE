import { TKeyName } from "../../controller/BaseController";
import Layout from "../Layout";
import { LayoutComponent } from "./LayoutComponent";

export class ReachableLayoutGroup extends LayoutComponent {
  get name(): string { return this.args[0] || '' };
  get direction(): string { return this.args[1] || '' };

  get binded_layout(): Layout {
    const lid = this.args[2];
    if (!lid) return this.layout;
    return this.layout.root.find_layout(lid) || this.layout
  }

  override on_player_key_down(_player_id: string, key: TKeyName): void {
    if (!this.binded_layout.global_visible) return;
    if (this.binded_layout.global_disabled) return;
    switch (this.direction) {
      case 'lr': if (key === 'L' || key === 'R') break; else return;
      case 'ud': if (key === 'U' || key === 'D') break; else return;
      default: return;
    }
    const items = this.layout.root.search_components(ReachableLayout, v => {
      return v.group_name === this.name && v.layout.global_visible && !v.layout.global_disabled
    });
    if (items.length <= 0) return;

    if (this.direction === 'lr')
      items.sort((a, b) => a.layout.x_on_root - b.layout.x_on_root);
    else if (this.direction === 'ud')
      items.sort((a, b) => a.layout.y_on_root - b.layout.y_on_root);

    const focused_layout = this.layout.focused_item;
    if (key === 'L' || key === 'U') {
      const idx = items.findIndex(v => v.layout === focused_layout);
      const next_idx = (Math.max(idx, 0) + items.length - 1) % items.length
      console.log(items, idx, next_idx)
      items[next_idx].layout.focused = true;
    } else if (key === 'R' || key === 'D') {
      const idx = items.findIndex(v => v.layout === focused_layout);
      const next_idx = (idx + 1) % items.length
      console.log(items, idx, next_idx)
      items[next_idx].layout.focused = true;
    }
  }
}

export class ReachableLayout extends LayoutComponent {
  get group_name(): string { return this.args[0]; }
  get group(): ReachableLayoutGroup | undefined {
    return this.layout.root.find_component(ReachableLayoutGroup, v => v.name === this.group_name)
  }
}