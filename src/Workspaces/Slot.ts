
import { ISlot } from "./ISlot";
import type { Workspaces } from "./Workspaces";

export class Slot implements ISlot {
  workspaces: Workspaces;
  id: string = '';
  type: 'v' | 'h' = 'v';
  children: Slot[] = [];
  parent: Slot | null = null;
  weight: number = 50;
  rect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  };
  constructor(workspaces: Workspaces, info: ISlot = {}, c: Slot[] = []) {
    this.workspaces = workspaces;
    const { rect, ..._info } = info;
    Object.assign(this, _info);
    Object.assign(this.rect, rect);
    this.children = c;
    if (!this.id) this.id = workspaces.new_slot_id()
    c.forEach(c => c.parent = this);
  }
  clone(): Slot {
    return new Slot(this.workspaces, this, this.children);
  }
  _handle_new_children(slots: Slot[]) {
    const total_f = this.children.reduce((r, i) => (r + i.weight), 0) || 1;
    const final_c_count = slots.length + this.children.length;
    const avg_f = total_f / final_c_count;
    const changed_f = (total_f - avg_f * slots.length);
    const scale = changed_f / total_f;
    this.children.forEach(c => c.weight *= scale);
    slots.forEach(c => c.weight = avg_f);
    for (const slot of slots) {
      slot.parent = this;
      slot.type = this.type === 'h' ? 'v' : 'h';
    }
  }
  insert(index: number, ...slots: Slot[]) {
    if (!slots.length) return;
    this._handle_new_children(slots);
    this.children.splice(index, 0, ...slots);
  }
  unshift(...slots: Slot[]) {
    if (!slots.length) return;
    this._handle_new_children(slots);
    this.children.unshift(...slots);
  }
  replace(index: number, ...slots: Slot[]): Slot {
    if (index < 0 || index >= this.children.length) throw new Error(`[Slot::replace] index out of bounds, idx: ${index}, size: ${this.children.length}`);
    const [ret] = this.children.splice(index, 1);
    const total_f = slots.reduce((r, i) => i.weight + r, 0);
    for (const slot of slots) {
      slot.parent = this;
      slot.type = ret.type;
      slot.weight = ret.weight * slot.weight / total_f;
    }
    this.children.splice(index, 0, ...slots);
    ret.parent = null;
    return ret;
  }
  push(...slots: Slot[]) {
    if (!slots.length) return;
    this._handle_new_children(slots);
    this.children.push(...slots);
  }
}
