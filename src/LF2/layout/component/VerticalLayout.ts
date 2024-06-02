import { LayoutComponent } from "./LayoutComponent";

export default class VerticalLayout extends LayoutComponent {

  on_render(dt: number): void {
    let y = 0;
    for (const l of this.layout.children) {
      if (!l.visible) continue;
      l.y = y;
      y += l.h - 1;
    }
  }
}