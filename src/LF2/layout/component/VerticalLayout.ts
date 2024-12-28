import { LayoutComponent } from "./LayoutComponent";

export default class VerticalLayout extends LayoutComponent {
  override on_render(dt: number): void {
    let w = 0;
    let h = 0;
    for (const l of this.layout.children) {
      if (!l.visible) continue;
      l.y = h;
      h += l.h;
      w = Math.max(w, l.w);
    }
    this.layout.size = [w, h];
    const p = this.layout.parent;
    if (p) {
      this.layout.x = (p.w - w) / 2;
      this.layout.y = (p.h - h) / 2;
    }
  }
}
