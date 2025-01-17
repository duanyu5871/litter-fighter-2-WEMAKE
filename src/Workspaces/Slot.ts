
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
  get type(): 'v' | 'h' { return this._type }
  set type(v: 'v' | 'h') { this._type = v }
  get children(): Readonly<Slot[]> { return this._children }
  get parent(): Slot | null { return this._parent }
  get prev(): Slot | null { return this._prev }
  get next(): Slot | null { return this._next }
  places: number = 1;
  weight: number = 50;
  rect = {
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
  protected _link_up() {
    let _prev: Slot | null = null
    for (const c of this.children) {
      c._type = this._type === 'h' ? 'v' : 'h';
      c._parent = this
      c._prev = _prev;
      if (_prev) _prev._next = c
      _prev = c
    }
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
