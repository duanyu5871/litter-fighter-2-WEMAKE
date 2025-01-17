import { Slot } from "./Slot";
import { SlotSnapshot } from "./SlotSnapshot";
import { Workspaces } from "./Workspaces";
import styles from "./style.module.scss";

export class Line {
  slot!: Slot;
  prev!: Slot;
  next!: Slot;
  private prev_snapshot?: SlotSnapshot;
  private next_snapshot?: SlotSnapshot;
  readonly workspaces: Workspaces;
  readonly element: HTMLElement;
  get actived() { return this._actived }
  private _actived: boolean = false;
  private _prev_ok_weight: number = 1;
  private _next_ok_weight: number = 1;
  private _down = { x: 0, y: 0 }
  private _offset = { x: 0, y: 0 }
  private _move = { x: 0, y: 0 }
  readonly on_pointerdown = (e: PointerEvent) => {
    this._down.x = e.clientX;
    this._down.y = e.clientY;
    this._offset.x = e.offsetX;
    this._offset.y = e.offsetY;
    this.prev_snapshot = this.prev.snapshot(true)
    this.next_snapshot = this.next.snapshot(true)
    const { element, workspaces, prev, next, slot } = this
    this._prev_ok_weight = prev.weight
    this._next_ok_weight = next.weight
    const { container } = workspaces
    element.classList.add(styles._line_hover)
    container.classList.add(slot.type === 'h' ? styles.zone_h_resizing : styles.zone_v_resizing)
    document.addEventListener('pointermove', this.on_move)
    document.addEventListener('pointercancel', this.on_end, { once: !0 })
    document.addEventListener('pointerup', this.on_end, { once: !0 })
    window.addEventListener('blur', this.on_end, { once: !0 })
    this._actived = true;
  }
  readonly on_move = (e: PointerEvent) => {
    const { workspaces } = this
    const { prev, next, slot, prev_snapshot, next_snapshot } = this
    if (!next_snapshot || !prev_snapshot) return;
    this._move.x = e.clientX + this._offset.x
    this._move.y = e.clientY + this._offset.y
    const diff = slot.type === 'h' ?
      this._move.x - this._down.x :
      this._move.y - this._down.y;
    prev.weight = prev_snapshot.weight() + diff
    next.weight = next_snapshot.weight() - diff
    if (workspaces.update()) {
      this._prev_ok_weight = prev.weight
      this._next_ok_weight = next.weight
    } else {
      prev.weight = this._prev_ok_weight
      next.weight = this._next_ok_weight
      workspaces.update()
    }
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