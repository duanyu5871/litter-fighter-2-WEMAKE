import { UIComponent } from "./UIComponent";

export default class VerticalLayout extends UIComponent {
  override update(dt: number): void {
    let w = 0;
    let h = 0;
    for (const l of this.node.children) {
      if (!l.visible) continue;
      const [x, , z] = l.pos.value;
      l.pos.value = [x, h, z];
      h += l.h;
      w = Math.max(w, l.w);
    }
    this.node.size.value = [w, h];
    const p = this.node.parent;
    if (p) {
      this.node.pos.value = [
        (p.w - w) / 2,
        (p.h - h) / 2,
        this.node.pos.value[2]
      ];
    }
  }
}

