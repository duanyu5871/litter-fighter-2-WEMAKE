

import { IRect } from "./IRect";
import { ISlot } from "./ISlot";
import { Slot } from "./Slot";
import styles from "./style.module.scss";
export class Workspaces {
  private _new_slot_id = 0;
  private _root: Slot;
  private _slots = new Map<string, Slot>();
  private _slot_cell_map = new Map<Slot, HTMLElement>();
  private _cell_slot_map = new Map<HTMLElement, Slot>();
  container: HTMLElement;
  cells: Readonly<HTMLElement[]> = [];
  get root(): Slot | undefined {
    return this._root;
  }
  constructor(container: HTMLElement) {
    this.container = container
    this.container.classList.add(styles.zone)
    this._root = new Slot(this)
  }
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
    this._root = root;
    this.update()
  }
  del_slot(s: Slot) {
    if (!s.parent) throw new Error(`[WorkspaceKeeper::add] can not delete root slot`)
    const _job = (s: Slot) => {
      if (!s.parent) return
      s.parent.children = s.parent.children.filter(v => v !== s);
      this.container.querySelector(`#${s.id}`)?.remove();
      this.container.querySelector(`[prev=${s.id}]`)?.remove();
      this.container.querySelector(`[next=${s.id}]`)?.remove();
      if (!s.parent.children.length) {
        _job(s.parent);
      } else if (s.parent.children.length === 1) {
        const remain_c = s.parent.children.shift()!
        remain_c.parent = null;
        let p: Slot = s.parent;
        let pp: Slot | null = s.parent.parent;
        while (pp) {
          if (pp.children.length > 1)
            break;
          p = pp;
          pp = pp.parent;
        }
        if (pp) {
          if (pp.type === remain_c.type) {
            pp.replace(pp.children.indexOf(p), ...remain_c.children)
          } else {
            pp.replace(pp.children.indexOf(p), remain_c)
          }
        } else {
          this._root = remain_c;
        }
      }
    }
    _job(s)
    this.update()
  }
  add(anchor_slot_id: string, pos: 'up' | 'down' | 'left' | 'right' | number, info: ISlot = {}): Slot {
    const anchor = this._slots.get(anchor_slot_id)
    if (!anchor) {
      debugger;
      throw new Error(`[WorkspaceKeeper::add] anchor_slot not found, id: ${anchor_slot_id}`)
    }
    const parent = anchor?.parent;
    const anchor_idx = parent?.children.indexOf(anchor);

    const slot = new Slot(this, info)
    if (this._slots.get(slot.id))
      throw new Error('slot id repeated!')

    if (typeof pos === 'number') {
      anchor.insert(pos, slot);
      this.container.querySelectorAll(`.${styles.v_line}`).forEach(v => v.remove())
      this.container.querySelectorAll(`.${styles.v_line}`).forEach(v => v.remove())
      this.update()
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
        const taken = parent.replace(anchor_idx!, wrapper)
        wrapper.push(slot, taken)
      } else {
        split_root(wrapper)
        wrapper.unshift(slot)
      }
    }
    const split_as_last = () => {
      const wrapper = new Slot(this)
      if (parent) {
        const taken = parent.replace(anchor_idx!, wrapper)
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
    this.container.querySelectorAll(`.${styles.v_line}`).forEach(v => v.remove())
    this.container.querySelectorAll(`.${styles.h_line}`).forEach(v => v.remove())
    this.update()
    return slot
  }
  make_rect(r: IRect) {
    r.w = Math.max(50, r.w);
    r.h = Math.max(50, r.h);
    return r;
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
      const f = Math.max(
        slot.rect[size_key] * slot.children[i].weight / total,
        50
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
      c.rect = this.make_rect({ ...rect })
      if (c.rect[size_key] !== rect[size_key])
        obj.ok = false;
      this.update_rects(c, obj)
      pos += cell_size
    })
    return obj.ok;
  }
  update_lines(slot: Slot) {
    const { container } = this;
    slot.children.forEach((prev, i, arr) => {
      const next = arr.at(i + 1)
      if (!next) {
        this.update_lines(prev)
        return
      }
      let l0 = container.querySelector(`[prev=${prev.id}]`) as HTMLElement | null;
      if (!l0) {
        const l = l0 = this.create_line_element()
        l.addEventListener('pointerdown', () => {
          const wrapper_slot_id = l.getAttribute('slot')
          const prev_slot_id = l.getAttribute('prev')
          const next_slot_id = l.getAttribute('next')
          if (!wrapper_slot_id || !prev_slot_id || !next_slot_id) return
          const wrapper = this._slots.get(wrapper_slot_id)
          const prev = this._slots.get(prev_slot_id)
          const next = this._slots.get(next_slot_id)
          if (!wrapper) return;

          l.classList.add(styles._line_hover)
          container.classList.add(wrapper.type === 'h' ? styles.zone_h_resizing : styles.zone_v_resizing)
          const on_move = (e: PointerEvent) => {
            const r = l.parentElement?.getBoundingClientRect();
            if (!r) return;
            const offset = wrapper.type === 'h' ?
              e.clientX - 2 - r.left - parseInt(l.style.left) :
              e.clientY - 2 - r.top - parseInt(l.style.top);
            let prev_slot = prev
            let next_slot = next
            if (!prev_slot || !next_slot)
              return
            const prev_slot_f = prev_slot.weight;
            const next_slot_f = next_slot.weight;
            prev_slot.weight = prev_slot.weight + offset
            next_slot.weight = next_slot.weight - offset
            if (!this.update()) {
              prev_slot.weight = prev_slot_f
              next_slot.weight = next_slot_f
              this.update()
              return
            }
          }
          const on_end = () => {
            document.removeEventListener('pointermove', on_move)
            l.classList.remove(styles._line_hover)
            container.classList.remove(styles.zone_h_resizing, styles.zone_v_resizing)
          }
          document.addEventListener('pointermove', on_move)
          document.addEventListener('pointercancel', on_end, { once: !0 })
          document.addEventListener('pointerup', on_end, { once: !0 })
          window.addEventListener('blur', on_end, { once: !0 })
        })
        container.appendChild(l0)
      }
      l0.className = slot.type === 'h' ? styles.v_line : styles.h_line
      l0.setAttribute('slot', slot.id)
      l0.setAttribute('prev', prev.id)
      l0.setAttribute('next', next.id)
      if (slot.type === 'h') {
        l0.style.height = '' + slot.rect.h + 'px'
        l0.style.left = '' + (next.rect.x - 2) + 'px'
        l0.style.width = ''
        l0.style.top = '' + slot.rect.y + 'px'
      } else {
        l0.style.height = ''
        l0.style.left = '' + slot.rect.x + 'px'
        l0.style.width = '' + slot.rect.w + 'px'
        l0.style.top = '' + (next.rect.y - 2) + 'px'
      }
      this.update_lines(prev)
    })
  }
  update_cells(slot: Slot, cells: HTMLElement[] = []) {
    const { container } = this;
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
  update_factors(slot: Slot) {
    slot.weight = slot.rect[slot.parent?.type === 'v' ? 'h' : 'w']
    slot.children.forEach(c => this.update_factors(c))
  }
  update(): boolean {
    const { container, _root } = this;
    if (!_root) return false;

    const r = container.getBoundingClientRect();
    _root.rect = this.make_rect({
      x: 0, y: 0,
      w: r.width,
      h: r.height
    });
    const ok = this.update_rects(_root);

    this.update_factors(_root);
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
    return ok
  }
}
