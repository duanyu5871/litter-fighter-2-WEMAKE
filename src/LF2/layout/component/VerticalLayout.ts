import { Component } from "./Component";

export default class VerticalLayout extends Component {
  override update(dt: number): void {
    let w = 0;
    let h = 0;
    for (const l of this.node.children) {
      if (!l.visible) continue;
      l.y = h;
      h += l.h;
      w = Math.max(w, l.w);
    }
    this.node.size = [w, h];
    const p = this.node.parent;
    if (p) {
      this.node.x = (p.w - w) / 2;
      this.node.y = (p.h - h) / 2;
    }
  }
}
