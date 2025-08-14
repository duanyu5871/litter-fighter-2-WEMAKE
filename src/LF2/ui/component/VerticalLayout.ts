import { UIComponent } from "./UIComponent";

export class VerticalLayout extends UIComponent {
  get gap() {
    return this.num(0) || 0
  }
  override update(dt: number): void {
    let max_w = 0;
    let max_h = 0;

    const [cx, cy] = this.node.center.value;
    const pos_list: [number, number, number][] = []
    for (const item of this.node.children) {
      if (!item.visible) continue;
      const [w, h] = item.size.value
      const [cx, cy] = item.center.value
      const [, , z] = item.pos.value;
      pos_list.unshift([(1 - cx) * w, max_h + (1 - cy) * h, z] as const)
      max_h += item.h + this.gap;
      max_w = Math.max(max_w, item.w);
    }

    for (const item of this.node.children) {
      if (!item.visible) continue;
      const [, h] = item.size.value
      const [x, y, z] = pos_list.pop()!
      const yy = y - cy * max_h - h
      const xx = cx * max_w - x
      item.pos.value = [xx, yy, z];
    }
    this.node.size.value = [max_w, max_h];
  }
}


