import { IRect } from "./IRect";
import { ISlot } from "./ISlot";
import { Line } from "./Line";
import { Slot } from "./Slot";
import styles from "./style.module.scss";
export class Workspaces {
  private _new_slot_id = 0;
  private _root: Slot;
  private _prev_line_map = new Map<string, Line>()
  private _next_line_map = new Map<string, Line>()
  private _slots = new Map<string, Slot>();
  private _slot_cell_map = new Map<Slot, HTMLElement>();
  private _cell_slot_map = new Map<HTMLElement, Slot>();
  private _resize_ob: ResizeObserver;
  private _container: HTMLElement;

  cells: Readonly<HTMLElement[]> = [];
  get container() { return this._container }
  get root(): Slot | undefined {
    return this._root;
  }
  constructor(container: HTMLElement) {
    this._container = container;
    this._container.classList.add(styles.zone);
    this._root = new Slot(this);
    this._resize_ob = new ResizeObserver(this.on_resize)
    this._resize_ob.observe(this._container);
    (window as any).w = this
  }
  release() {
    this._container.classList.remove(styles.zone, styles.zone_h_resizing, styles.zone_v_resizing)
    this._container.innerHTML = '';
    this._resize_ob.disconnect();
  }
  on_resize = () => this.update()
  on_cell_changed?: (self: Workspaces) => void;
  on_changed?: (self: Workspaces) => void;
  create_cell_element(): HTMLElement {
    return document.createElement('div')
  }
  create_line_element(): HTMLElement {
    return document.createElement('div')
  }
  new_slot_id() {
    let ret = 'slot_' + (++this._new_slot_id)
    while (this._slots.has(ret)) {
      ret = 'slot_' + (++this._new_slot_id)
    }
    return ret;
  }
  get_slot(cell: HTMLElement) {
    return this._cell_slot_map.get(cell)
  }
  get_cell(slot: Slot) {
    return this._slot_cell_map.get(slot)
  }
  set_root(root: Slot) {
    const r = this.container.getBoundingClientRect();
    this._root = root;
    this._root.rect.x = 0;
    this._root.rect.y = 0;
    this._root.rect.w = r.width;
    this._root.rect.h = r.height;
  }
  del_slot(s: Slot) {
    if (!s.parent) throw new Error(`[Workspaces::add] can not delete root slot`)
    const _job = (s: Slot) => {
      const s_parent = s.remove_self();
      if (!s_parent) return;
      this.get_cell(s)?.remove()

      this._prev_line_map.get(s.id)?.release()
      this._next_line_map.get(s.id)?.release()

      if (s_parent.children.length > 1)
        return;

      if (s_parent.children.length === 0)
        return _job(s_parent);

      const remain_c = s_parent.shift()!
      let child: Slot = s_parent;
      let parent: Slot | null = s_parent.parent;
      while (parent) {
        if (parent.children.length > 1)
          break;
        child = parent;
        parent = parent.parent;
      }
      if (!parent) {
        this._root = remain_c;
        return
      }
      if (parent.type !== remain_c.type) {
        parent.replace(child, remain_c)
        return;
      }
      if (remain_c.children.length) {
        parent.replace(child, ...remain_c.children)
      }
    }
    _job(s)
  }
  del(slot_id: string): Slot | undefined {
    const slot = this._slots.get(slot_id)
    if (!slot) return slot
    this.del_slot(slot);
    return slot
  }
  find(slot_id: string | 0): Slot | undefined {
    if (slot_id === 0) return this._root;
    return this._slots.get(slot_id)
  }
  edits(slot_ids: (string | 0)[], mode: 0, fn: (slots: (Slot | undefined)[]) => void): void;
  edits(slot_ids: (string | 0)[], mode: 1, fn: (slots: Slot[]) => void): void;
  edits(slot_ids: (string | 0)[], mode: 2, fn: (slots: Slot[]) => void): void;
  edits(slot_ids: (string | 0)[], mode: 0 | 1 | 2, fn: ((slots: Slot[]) => void) | ((slots: (Slot | undefined)[]) => void)) {
    const slots = slot_ids.map(i => this.find(i))
    switch (mode) {
      case 0:
        fn(slots as any)
        return;
      case 1:
        if (slots.indexOf(void 0) < 0)
          fn(slots as any);
        return
      case 2:
        fn(slots.filter(Boolean) as any);
        return
    }
  }
  edit(slot_id: string | 0, fn: (slot: Slot) => void) {
    if (slot_id === 0) {
      const s = this._root;
      s && fn(s)
    } else if (typeof slot_id === 'string') {
      const s = this._slots.get(slot_id)
      s && fn(s)
    }
  }
  add(anchor_slot_id: string, pos: 'up' | 'down' | 'left' | 'right' | number, info: Partial<ISlot> = {}, dont_throw = true): Slot | null {
    const anchor = this._slots.get(anchor_slot_id)
    if (!anchor) {
      const msg = `[Workspaces::add] anchor_slot not found, id: ${anchor_slot_id}`
      if (dont_throw) return null
      throw new Error(msg)
    }
    const parent = anchor?.parent;
    const anchor_idx = parent?.children.indexOf(anchor);

    const slot = new Slot(this, info)
    if (this._slots.get(slot.id)) {
      if (dont_throw) return this._slots.get(slot.id)!
      throw new Error(`slot id ${JSON.stringify(slot.id)} repeated!`)
    }

    this._slots.set(slot.id, slot)
    if (typeof pos === 'number') {
      anchor.insert(pos, slot);
      return slot
    }
    const split_root = (wrapper: Slot) => {
      const old_root = this.root!;
      if (typeof pos === 'string') {
        switch (pos) {
          case "up":
          case "down": wrapper.type = 'v'; break;
          case "left":
          case "right": wrapper.type = 'h'; break;
        }
      }
      this._root = wrapper;
      wrapper.push(old_root);
    }
    const split_as_first = () => {
      const wrapper = new Slot(this)
      if (parent) {
        const taken = parent.replace(anchor_idx!, wrapper)!
        wrapper.push(slot, taken)
      } else {
        split_root(wrapper)
        wrapper.unshift(slot)
      }
    }
    const split_as_last = () => {
      const wrapper = new Slot(this)
      if (parent) {
        const taken = parent.replace(anchor_idx!, wrapper)!
        wrapper.push(taken, slot);
      } else {
        split_root(wrapper)
        wrapper.push(slot);
      }
    }
    const insert_before = () => {
      if (parent) {
        parent.insert(anchor_idx!, slot);
      } else {
        split_as_first();
      }
    }
    const insert_after = () => {
      if (parent) {
        parent.insert(1 + anchor_idx!, slot);
      } else {
        split_as_last();
      }
    }
    const shit = `${anchor.type} ${pos}` as const
    switch (shit) {
      case "v up":
      case "h left": split_as_first(); break;
      case "v down":
      case "h right": split_as_last(); break;
      case "v left":
      case "h up": insert_before(); break;
      case "v right":
      case "h down": insert_after(); break;
    }
    return slot
  }

  update_rects(slot: Slot, obj: { ok: boolean } = { ok: true }) {
    if (!slot.children?.length) return obj.ok;
    let { x, y, w, h } = slot.rect;
    const size_key = slot.type === 'h' ? 'w' : 'h';
    const pos_key = slot.type === 'h' ? 'x' : 'y';
    let pos = slot.type === 'h' ? x : y;
    const total = slot.children.reduce((r, c) => r + c.weight, 0)
    let remain = slot.rect[size_key];
    const cell_size_list: number[] = []

    for (let i = 0; i < slot.children.length; ++i) {
      const child = slot.children[i]
      const f = Math.max(
        slot.rect[size_key] * child.weight / total,
        50 * child.crosscut
      );
      const cell_size = Math.floor(f)
      cell_size_list.push(cell_size);
      remain -= cell_size;
    }
    while (remain > 0) {
      for (let i = 0; i < cell_size_list.length && remain; ++i) {
        cell_size_list[i] += 1;
        --remain
      }
    }
    if (remain < 0) obj.ok = false
    slot.children.forEach((c, i) => {
      let cell_size = cell_size_list[i]
      const rect: IRect = { x, y, w, h }
      rect[size_key] = cell_size;
      rect[pos_key] = pos;
      // c.rect = this.make_rect({ ...rect })
      c.rect = { ...rect }
      if (c.rect[size_key] !== rect[size_key])
        obj.ok = false;
      this.update_rects(c, obj)
      pos += cell_size
    })
    return obj.ok;
  }


  update_lines(slot: Slot) {
    slot.children.forEach((prev, i, arr) => {
      const next = arr.at(i + 1)
      this.update_lines(prev)
      if (!next) return

      let line = this._prev_line_map.get(prev.id)
      if (!line) {
        line = new Line(this, slot, prev, next)
      } else {
        this._prev_line_map.delete(prev.id)
        this._next_line_map.delete(next.id)
        line.set_slots(slot, prev, next)
      }
      this._prev_line_map.set(prev.id, line)
      this._next_line_map.set(next.id, line)
    })
  }
  update_cells(slot: Slot, cells: HTMLElement[] = []) {
    const { _container: container } = this;
    if (slot.children.length) {
      slot.children.forEach(c => this.update_cells(c, cells))
      return cells
    }
    let cell = container.querySelector(`#${slot.id}`) as HTMLElement | null
    if (!cell) {
      cell = this.create_cell_element()
      cell.id = slot.id
      cell.className = styles.cell
      container.appendChild(cell)
    }
    cell.style.left = '' + slot.rect.x + 'px'
    cell.style.top = '' + slot.rect.y + 'px'
    cell.style.width = '' + slot.rect.w + 'px'
    cell.style.height = '' + slot.rect.h + 'px'
    cells.push(cell)
    this._slot_cell_map.set(slot, cell)
    this._cell_slot_map.set(cell, slot)
    return cells
  }

  confirm() {
    for (const [, v] of this._prev_line_map)
      v.release();
    this._prev_line_map.clear()
    this._next_line_map.clear()
    this.update()
  }
  update() {
    const { _container: container, _root } = this;
    if (!_root) return false;
    const r = container.getBoundingClientRect();
    _root.update_dimension()
    _root.update_rect({
      x: 0,
      y: 0,
      w: r.width,
      h: r.height
    })

    this.update_lines(_root);
    this._slot_cell_map.clear();
    this._cell_slot_map.clear();
    this.cells = this.update_cells(_root);
    this._slots.clear();
    const _job = (s: Slot) => {
      this._slots.set(s.id, s)
      s.children.forEach(_job)
    }
    _job(_root)
    this.on_changed?.(this)
    if (this.on_cell_changed) {
      const next_cell_ids = this.cells.map(v => v.id).sort().join()
      if (this._prev_cell_ids !== next_cell_ids) {
        this._prev_cell_ids = next_cell_ids;
        this.on_cell_changed?.(this);
      }
    }
  }
  slots_dirty() {
    for (const [, l] of this._prev_line_map) {
      if (l.actived) l.on_end()
    }
  }
  private _prev_cell_ids = ''
}
