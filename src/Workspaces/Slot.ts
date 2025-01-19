
import { IRect } from "@fimagine/writeboard";
import { ISlot } from "./ISlot";
import { SlotSnapshot } from "./SlotSnapshot";
import type { Workspaces } from "./Workspaces";
export class Slot implements ISlot {
  private _children: Slot[] = [];
  readonly workspaces: Workspaces;
  readonly id: string = '';
  private _parent: Slot | null = null;
  private _prev: Slot | null = null;
  private _next: Slot | null = null;
  private _type: 'v' | 'h' = 'v';
  private _weight_dirty = true;
  get type(): 'v' | 'h' { return this._type }
  set type(v: 'v' | 'h') { this._type = v }
  get children(): Readonly<Slot[]> { return this._children }
  get parent(): Slot | null { return this._parent }
  get prev(): Slot | null { return this._prev }
  get next(): Slot | null { return this._next }
  get size(): [number, number] {
    return [
      this.crosscut,
      this.slitting
    ]
  }
  crosscut: number = 1
  slitting: number = 1
  weight: number = 50

  rect: IRect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  };
  constructor(workspaces: Workspaces, info: Partial<ISlot> = {}, c: Slot[] = []) {
    this.workspaces = workspaces;
    const { rect, ..._info } = info;
    Object.assign(this, _info);
    Object.assign(this.rect, rect);
    this._children = c;
    if (!this.id) this.id = workspaces.new_slot_id()
    this._link_up()
  }
  confirm(): void {
    this.workspaces.confirm()
  }
  clone(): Slot {
    return new Slot(this.workspaces, this, this._children);
  }
  snapshot(no_children: boolean = false): SlotSnapshot {
    return new SlotSnapshot(this._snapshot(no_children))
  }
  update_dimension(): readonly [number, number] {
    const _job = (slot: Slot): readonly [number, number] => {
      if (slot.children.length <= 1) {
        return [
          slot.crosscut = 1,
          slot.slitting = 1
        ]
      }
      const crosscuts: number[] = [];
      for (const child of slot.children) {
        _job(child)
        crosscuts.push(child.children.reduce((r, i) => r + i.crosscut, 0))
      }
      return [
        slot.crosscut = Math.max(...crosscuts, 1),
        slot.slitting = slot.children.reduce((r, i) => r + i.crosscut, 0)
      ]
    }
    return _job(this)
  }
  update_weight() {
    const _job = (slot: Slot) => {
      slot.weight = slot.rect[slot.parent?.type === 'v' ? 'h' : 'w']
      slot.children.forEach(c => _job(c))
    }
    _job(this);
  }
  update_rect(rect: IRect) {
    const _job = (slot: Slot, rect: IRect) => {
      const pos_key = slot._type === 'v' ? 'y' : 'x'
      const size_key = slot._type === 'v' ? 'h' : 'w'
      const [w_size, h_size] = (
        slot._type === 'v' ?
          [slot.crosscut, slot.slitting] as const :
          [slot.slitting, slot.crosscut] as const
      )
      slot.rect.x = rect.x;
      slot.rect.y = rect.y;
      slot.rect.w = Math.max(rect.w, w_size * 50);
      slot.rect.h = Math.max(rect.h, h_size * 50);
      const weight_sum = slot.children.reduce((r, i) => r + i.weight, 0);
      let pos = slot.rect[pos_key]
      for (const child of slot.children) {
        const child_rect = { ...slot.rect }
        child_rect[pos_key] = pos;
        child_rect[size_key] = slot.rect[size_key] * child.weight / weight_sum;
        _job(child, child_rect)
        pos += child.rect[size_key]
      }
    }
    _job(this, rect)
    this.update_weight();
  }
  get root() {
    let p: Slot = this;
    while (p?.parent) p = p.parent;
    return p;
  }
  protected _link_up() {
    let _prev: Slot | null = null
    for (const c of this.children) {
      c._type = this._type === 'h' ? 'v' : 'h';
      c._parent = this
      c._prev = _prev;
      if (_prev) _prev._next = c
      _prev = c
    }
    this.root._weight_dirty = true
    this.workspaces.slots_dirty()
  }
  protected _snapshot(no_children: boolean = false): ISlot {
    const children: ISlot[] = []
    const ret: ISlot = {
      id: this.id,
      type: this.type,
      parent: null,
      rect: { ...this.rect },
      weight: this.weight,
      children: children,
      prev: null,
      next: null,
    }
    if (!no_children) {
      let _prev: ISlot | null = null
      for (const v of this.children) {
        const c = v._snapshot()
        c.parent = ret
        c.prev = _prev;
        if (_prev) _prev.next = c
        _prev = c
        children.push(c)
      }
    }
    return ret;
  }
  _handle_new_children(slots: Slot[]) {
    const total_f = this.children.reduce((r, i) => (r + i.weight), 0) || 1;
    const final_c_count = slots.length + this.children.length;
    const avg_f = total_f / final_c_count;
    const changed_f = (total_f - avg_f * slots.length);
    const scale = changed_f / total_f;
    this.children.forEach(c => c.weight *= scale);
    slots.forEach(c => c.weight = avg_f);
  }
  insert(index: number, ...slots: Slot[]) {
    if (!slots.length) return;
    this._handle_new_children(slots);
    this._children.splice(index, 0, ...slots);
    this._link_up()
  }
  unshift(...slots: Slot[]) {
    if (!slots.length) return;
    this._handle_new_children(slots);
    this._children.unshift(...slots);
    this._link_up();
  }
  shift(): Slot | undefined {
    const ret = this._children.shift()
    if (!ret) return ret;
    ret._parent = null;
    ret._prev = null;
    ret._next = null;
    this._link_up();
    return ret;
  }
  remove(slot: Slot) {
    const index = this._children.indexOf(slot);
    if (index < 0) return false;
    this._children.splice(index, 1)
    slot._parent = null;
    slot._prev = null;
    slot._next = null;
    this._link_up()
    return true;
  }

  replace(index: number, ...slots: Slot[]): Slot | undefined
  replace(slot: Slot, ...slots: Slot[]): Slot | undefined
  replace(index: number | Slot, ...slots: Slot[]): Slot | undefined {
    if (typeof index !== 'number')
      index = this.children.indexOf(index)
    if (index < 0 || index >= this.children.length) {
      console.warn(`[Slot::replace] index out of bounds, idx: ${index}, size: ${this.children.length}`);
      return void 0;
    }
    if (!slots.length) {
      const ret = this.children[index];
      this.remove(ret)
      return ret
    }

    const [ret] = this._children.splice(index, 1);
    const total_f = slots.reduce((r, i) => i.weight + r, 0);
    for (const slot of slots) {
      slot._parent = this;
      slot._type = ret.type;
      slot.weight = ret.weight * slot.weight / total_f;
    }
    ret._parent = null;
    ret._prev = null;
    ret._next = null;
    this._children.splice(index, 0, ...slots);
    this._link_up()
    return ret;
  }

  push(...slots: Slot[]) {
    if (!slots.length) return;
    this._handle_new_children(slots);
    this._children.push(...slots);
    this._link_up();
  }

  remove_self(): Slot | null {
    const { parent } = this
    parent?.remove(this)
    return parent
  }
}
