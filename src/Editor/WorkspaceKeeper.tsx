
import { IRect } from "@fimagine/writeboard";
import styles from "./style.module.scss";
export interface ISlot {
  id?: string;
  t?: 'v' | 'h';
  p?: Slot | null;
  r?: Partial<IRect>;
  f?: number;
}
export class Slot {
  id: string = '';
  t: 'v' | 'h' = 'v';
  c: Slot[] = [];
  p: Slot | null = null
  f: number = 50
  r: IRect = {
    x: 0,
    y: 0,
    w: 0,
    h: 0
  }
  constructor(info: ISlot, c: Slot[] = []) {
    const { r, ..._info } = info
    Object.assign(this, _info)
    Object.assign(this.r, r)
    this.c = c
    c.forEach(c => c.p = this)
  }
  clone(): Slot {
    const ret = new Slot(this, this.c)
    Object.assign(ret, this)
    return ret;
  }
}
export interface CellElement extends HTMLDivElement {
  i_slot: Slot
}
export class WorkspaceKeeper {
  root_slot?: Slot;
  container: HTMLDivElement;
  cells: CellElement[] = [];
  on_changed?: (self: WorkspaceKeeper) => void;
  constructor(container: HTMLDivElement) {
    this.container = container
    this.container.classList.add(styles.zone)
  }
  del_slot(s: Slot) {
    const _del = (s: Slot) => {
      if (s.p?.c) s.p.c = s.p.c.filter(v => v !== s);
      this.container.querySelector(`#${s.id}`)?.remove();
      this.container.querySelector(`[prev=${s.id}]`)?.remove();
      this.container.querySelector(`[next=${s.id}]`)?.remove();
      if (s.p && !s.p.c.length) _del(s.p);
    }
    _del(s)
    this.update()
  }
  make_rect(r: IRect) {
    r.w = Math.max(50, r.w);
    r.h = Math.max(50, r.h);
    return r;
  }
  make_slot_rect(slot: Slot, obj: { ok: boolean } = { ok: true }) {
    if (!slot.c?.length) return obj.ok;
    let { x, y, w, h } = slot.r;
    const size_key = slot.t === 'h' ? 'w' : 'h';
    const pos_key = slot.t === 'h' ? 'x' : 'y';
    let pos = slot.t === 'h' ? x : y;
    const total = slot.c.reduce((r, c) => r + c.f, 0)
    let remain = slot.r[size_key];
    const cell_size_list: number[] = []
    for (let i = 0; i < slot.c.length; ++i) {
      const f = Math.max(
        slot.r[size_key] * slot.c[i].f / total,
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
    slot.c.forEach((c, i) => {
      let cell_size = cell_size_list[i]
      const rect: IRect = { x, y, w, h }
      rect[size_key] = cell_size;
      rect[pos_key] = pos;
      c.r = this.make_rect({ ...rect })
      if (c.r[size_key] !== rect[size_key])
        obj.ok = false;
      this.make_slot_rect(c, obj)
      pos += cell_size
    })
    return obj.ok;
  }

  make_slot_line(slot: Slot) {
    const { container } = this;
    slot.c.forEach((prev, i, arr) => {
      const next = arr.at(i + 1)
      if (next) {
        let l0 = container.querySelector(`[prev=${prev.id}]`) as HTMLDivElement | null;
        let l1 = container.querySelector(`[next=${next.id}]`) as HTMLDivElement | null;
        if (!l0) {
          const l = Object.assign(
            l0 = document.createElement('div'), {
            i_slot: slot,
            index: i,
          })
          l.className = slot.t === 'h' ? styles.v_line : styles.h_line
          l.setAttribute('slot', slot.id)
          l.setAttribute('prev', prev.id)
          l.setAttribute('next', next.id)
          l.addEventListener('pointerdown', () => {
            l.classList.add(styles._line_hover)
            container.classList.add(slot.t === 'h' ? styles.zone_h_resizing : styles.zone_v_resizing)
            const on_move = (e: PointerEvent) => {
              const r = l.parentElement?.getBoundingClientRect();
              if (!r) return;
              const offset = slot.t === 'h' ?
                e.clientX - 2 - r.left - parseInt(l.style.left) :
                e.clientY - 2 - r.top - parseInt(l.style.top);
              let idx = l.index;
              let prev_slot = l.i_slot.c.at(idx)
              let next_slot = l.i_slot.c.at(idx + 1)
              if (!prev_slot || !next_slot)
                return
              const prev_slot_f = prev_slot.f;
              const next_slot_f = next_slot.f;
              prev_slot.f = prev_slot.f + offset
              next_slot.f = next_slot.f - offset
              if (!this.update()) {
                prev_slot.f = prev_slot_f
                next_slot.f = next_slot_f
                this.update()
                return
              }
              console.log(this.root_slot)
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
          l1?.remove()
        }
        if (slot.t === 'h') {
          l0.style.height = '' + slot.r.h + 'px'
          l0.style.left = '' + (next.r.x - 2) + 'px'
          l0.style.width = ''
          l0.style.top = '' + slot.r.y + 'px'
        } else {
          l0.style.height = ''
          l0.style.left = '' + slot.r.x + 'px'
          l0.style.width = '' + slot.r.w + 'px'
          l0.style.top = '' + (next.r.y - 2) + 'px'
        }
      }
      this.make_slot_line(prev)
    })
  }
  make_slot_ele(slot: Slot, cells: (CellElement)[] = []) {
    const { container } = this;
    if (slot.c.length) {
      slot.c.forEach(c => this.make_slot_ele(c, cells))
      return cells
    }
    let cell = container.querySelector(`#${slot.id}`) as HTMLDivElement | null
    if (!cell) {
      cell = document.createElement('div')
      cell.id = slot.id
      cell.className = styles.cell
      container.appendChild(cell)
    }
    cell.style.left = '' + slot.r.x + 'px'
    cell.style.top = '' + slot.r.y + 'px'
    cell.style.width = '' + slot.r.w + 'px'
    cell.style.height = '' + slot.r.h + 'px'
    cells.push(Object.assign(cell, { i_slot: slot }))
    return cells
  }
  make_slot_factor(slot: Slot) {
    slot.f = slot.r[slot.p?.t === 'v' ? 'h' : 'w']
    slot.c.forEach(c => this.make_slot_factor(c))
  }
  update() {
    const { container, root_slot } = this;
    const r = container.getBoundingClientRect();
    if (!root_slot) return;
    root_slot.r = this.make_rect({
      x: 0, y: 0,
      w: r.width,
      h: r.height
    });
    const ok = this.make_slot_rect(root_slot);
    this.make_slot_factor(root_slot);
    this.make_slot_line(root_slot);
    this.cells = this.make_slot_ele(root_slot);
    this.on_changed?.(this)
    return ok
  }
}
