import { IRect } from "./IRect";
import { Slot } from "./Slot";
import { SlotSnapshot } from "./SlotSnapshot";
import { Workspaces } from "./Workspaces";
import styles from "./style.module.scss";

export class Line {
  slot!: Slot;
  prev!: Slot;
  next!: Slot;
  private snapshots = new Map<Slot, SlotSnapshot>();
  private ok_weights = new Map<Slot, { f: number, r: IRect }>();
  readonly workspaces: Workspaces;
  readonly element: HTMLElement;
  get actived() { return this._actived }
  private _actived: boolean = false;
  private _down = { x: 0, y: 0 }
  private _offset = { x: 0, y: 0 }
  private _move = { x: 0, y: 0 }
  readonly on_pointerdown = (e: PointerEvent) => {
    this._down.x = e.clientX;
    this._down.y = e.clientY;
    this._offset.x = e.offsetX;
    this._offset.y = e.offsetY;

    this.snapshots.clear();
    this.ok_weights.clear();
    for (const child of this.slot.children) {
      this.snapshots.set(child, child.snapshot(true))
    }
    this.save_weights(this.slot)
    const { element, workspaces, slot } = this
    const { container } = workspaces
    element.classList.add(styles._line_hover)
    container.classList.add(slot.type === 'h' ? styles.zone_h_resizing : styles.zone_v_resizing)
    document.addEventListener('pointermove', this.on_move)
    document.addEventListener('pointercancel', this.on_end, { once: !0 })
    document.addEventListener('pointerup', this.on_end, { once: !0 })
    window.addEventListener('blur', this.on_end, { once: !0 })
    this._actived = true;
  }
  save_weights(slot: Slot) {
    this.ok_weights.set(slot, { f: slot.weight, r: { ...slot.rect } })
    for (const child of slot.children) {
      this.save_weights(child);
    }
  }
  restore_weights(slot: Slot) {
    const { f, r } = this.ok_weights.get(slot)!
    slot.weight = f;
    slot.rect.x = r.x
    slot.rect.y = r.y
    slot.rect.w = r.w
    slot.rect.h = r.h
    for (const child of slot.children) {
      this.restore_weights(child);
    }
  }

  readonly on_move = (e: PointerEvent) => {
    const { workspaces } = this
    const { prev, next, slot } = this
    this._move.x = e.clientX + this._offset.x
    this._move.y = e.clientY + this._offset.y
    let diff = slot.type === 'h' ?
      this._move.x - this._down.x :
      this._move.y - this._down.y;
    const _p_w = this.snapshots.get(prev)!.weight() + diff
    const _n_w = this.snapshots.get(next)!.weight() - diff
    const min_p_w = 50 * (slot.type === 'h' ? prev.crosscut : prev.slitting);
    const min_n_w = 50 * (slot.type === 'h' ? next.crosscut : next.slitting);
    prev.weight = Math.max(_p_w, min_p_w);
    next.weight = Math.max(_n_w, min_n_w);
    if (workspaces.update()) {
      // this.save_weights(this.slot)
      return
    }
    // if (_p_w < min_p_w) {
    //   let need_space = min_p_w - _p_w;
    //   let temp: Slot | null = prev.prev;
    //   while (need_space > 0 && temp) {
    //     if (temp.weight <= temp.crosscut * 50) {
    //       temp = temp.prev
    //       continue;
    //     }
    //     if (temp.children.length) {
    //       next.weight += 1
    //     } else {
    //       temp.weight -= 1
    //     }
    //     --need_space;
    //     temp = temp.prev
    //   }
    //   if (need_space) {
    //     this.restore_weights(this.slot)
    //     workspaces.update()
    //     return;
    //   }
    // }
    // if (_n_w < min_n_w) {
    //   console.log('next_')
    //   let need_space = min_n_w - _n_w;
    //   let temp: Slot | null = next.next;
    //   while (need_space > 0 && temp) {
    //     if (temp.weight <= temp.crosscut * 50) {
    //       temp = temp.next
    //       continue;
    //     }
    //     temp.weight -= 1
    //     --need_space;
    //     temp = temp.next
    //   }
    //   if (need_space) {
    //     this.restore_weights(this.slot)
    //     workspaces.update()
    //     return;
    //   }
    // }
    // if (workspaces.update()) {
    //   this.save_weights(this.slot)
    //   return
    // }
  }

  readonly on_end = () => {
    document.removeEventListener('pointermove', this.on_move)
    this.element.classList.remove(styles._line_hover)
    this.workspaces.container.classList.remove(styles.zone_h_resizing, styles.zone_v_resizing)
    this._actived = false;
  }

  constructor(workspaces: Workspaces, slot: Slot, prev: Slot, next: Slot) {
    this.workspaces = workspaces;
    this.element = workspaces.create_line_element()
    this.element.addEventListener('pointerdown', this.on_pointerdown)
    workspaces.container.appendChild(this.element)
    this.set_slots(slot, prev, next)
  }

  set_slots(slot: Slot, prev: Slot, next: Slot) {
    const { element } = this
    this.slot = slot
    this.prev = prev
    this.next = next
    if (slot.type === 'h') {
      element.classList.add(styles.v_line)
      element.classList.remove(styles.h_line)
      element.style.height = '' + slot.rect.h + 'px'
      element.style.left = '' + (next.rect.x - 2) + 'px'
      element.style.width = ''
      element.style.top = '' + slot.rect.y + 'px'
    } else {
      element.classList.add(styles.h_line)
      element.classList.remove(styles.v_line)
      element.style.height = ''
      element.style.left = '' + slot.rect.x + 'px'
      element.style.width = '' + slot.rect.w + 'px'
      element.style.top = '' + (next.rect.y - 2) + 'px'
    }
  }

  release(): void {
    if (this._actived) this.on_end()
    this.element.remove();
  }
}