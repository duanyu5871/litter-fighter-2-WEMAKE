import { UIComponent } from "./UIComponent";

export class HorizontalLayout extends UIComponent {
  override update(dt: number): void {
    let w = 0;
    let h = 0;
    for (const l of this.node.children) {
      if (!l.visible) continue;
      l.x = w;
      w += l.w;
      h = Math.max(h, l.h);
    }
    this.node.size = [w, h];
    const p = this.node.parent;
    if (p) {
      this.node.x = (p.w - w) / 2;
      this.node.y = (p.h - h) / 2;
    }
  }
}
