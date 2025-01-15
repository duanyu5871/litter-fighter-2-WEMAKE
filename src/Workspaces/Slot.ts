
import { ISlot } from "./ISlot";
import type { Workspaces } from "./Workspaces";

export class Slot {
  workspaces: Workspaces;
  id: string = '';
  t: 'v' | 'h' = 'v';
  c: Slot[] = [];
  p: Slot | null = null;
  f: number = 50;
  r = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  };
  constructor(workspaces: Workspaces, info: ISlot = {}, c: Slot[] = []) {
    this.workspaces = workspaces;
    const { r, ..._info } = info;
    Object.assign(this, _info);
    Object.assign(this.r, r);
    this.c = c;
    if (!this.id) this.id = workspaces.new_slot_id()
    c.forEach(c => c.p = this);
  }
  clone(): Slot {
    const ret = new Slot(this.workspaces, this, this.c);
    Object.assign(ret, this);
    return ret;
  }
  _handle_new_children(slots: Slot[]) {
    const total_f = this.c.reduce((r, i) => (r + i.f), 0) || 1;
    const final_c_count = slots.length + this.c.length;
    const avg_f = total_f / final_c_count;
    const changed_f = (total_f - avg_f * slots.length);
    const scale = changed_f / total_f;
    this.c.forEach(c => c.f *= scale);
    slots.forEach(c => c.f = avg_f);
    for (const slot of slots) {
      slot.p = this;
      slot.t = this.t === 'h' ? 'v' : 'h';
    }
  }
  insert(index: number, ...slots: Slot[]) {
    if (!slots.length) return;
    this._handle_new_children(slots);
    this.c.splice(index, 0, ...slots);
  }
  unshift(...slots: Slot[]) {
    if (!slots.length) return;
    this._handle_new_children(slots);
    this.c.unshift(...slots);
  }
  replace(index: number, ...slots: Slot[]): Slot {
    if (index < 0 || index >= this.c.length) throw new Error(`[Slot::replace] index out of bounds, idx: ${index}, size: ${this.c.length}`);
    const [ret] = this.c.splice(index, 1);
    const total_f = slots.reduce((r, i) => i.f + r, 0);
    for (const slot of slots) {
      slot.p = this;
      slot.t = ret.t;
      slot.f = ret.f * slot.f / total_f;
    }
    this.c.splice(index, 0, ...slots);
    ret.p = null;
    return ret;
  }
  push(...slots: Slot[]) {
    if (!slots.length) return;
    this._handle_new_children(slots);
    this.c.push(...slots);
  }
}
