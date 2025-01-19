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
  private _move = { x: 0, y: 0 }
  readonly on_pointerdown = (e: PointerEvent) => {
    this._down.x = e.clientX;
    this._down.y = e.clientY;

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
    const { slot } = this
    this._move.x = e.clientX
    this._move.y = e.clientY
    let diff = slot.type === 'h' ?
      this._move.x - this._down.x :
      this._move.y - this._down.y;
    if (diff === 0) return;

    const size_key = slot.type === 'h' ? 'w' : 'h'
    const glow_name = diff > 0 ? 'prev' : 'next'
    const shrink_name = diff > 0 ? 'next' : 'prev'

    let shrink_value = Math.abs(diff);

    const glowing_slot = this[glow_name]
    let weight = this.snapshots.get(glowing_slot)!.weight(0) + shrink_value
    const rect1 = { ...glowing_slot.rect }
    rect1[size_key] = weight
    glowing_slot.update_rect(rect1)
    glowing_slot.weight = weight;

    let changeless_slot = glowing_slot[glow_name]
    while (changeless_slot) {
      const ss = this.snapshots.get(changeless_slot)!
      changeless_slot.weight = ss.weight(0)
      const { x, y, w, h } = ss.rect(0)
      changeless_slot.rect.x = x
      changeless_slot.rect.y = y
      changeless_slot.rect.w = w
      changeless_slot.rect.h = h
      changeless_slot = changeless_slot[glow_name]
    }

    let shrink_slot = this[shrink_name];
    do {
      let weight = this.snapshots.get(shrink_slot)!.weight(0) - shrink_value
      const min_size = shrink_slot.crosscut * 50
      if (weight < min_size) {
        shrink_value = min_size - weight;
        weight = min_size;
      } else {
        shrink_value = 0
      }
      const rect2 = { ...shrink_slot.rect }
      rect2[size_key] = weight
      shrink_slot.update_rect(rect2)
      shrink_slot.weight = weight
      if (!shrink_slot[shrink_name] || shrink_value <= 0)
        break;
      shrink_slot = shrink_slot[shrink_name]
    } while (shrink_slot && shrink_value > 0)


    const src_weight_sum = slot.children.reduce((r, i) => r + this.snapshots.get(i)!.weight(0), 0)
    const cur_weigth_sum = slot.children.reduce((r, i) => r + i.weight, 0);
    if (cur_weigth_sum > src_weight_sum) {
      const w = src_weight_sum - (cur_weigth_sum - glowing_slot.weight)
      const rect1 = { ...glowing_slot.rect }
      rect1[size_key] = w
      glowing_slot.update_rect(rect1)
      glowing_slot.weight = w
    }
    workspaces.update()
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