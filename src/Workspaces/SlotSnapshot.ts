import { IRect } from "./IRect";
import { ISlot } from "./ISlot";

export class SlotSnapshot {

  rect(slot_id?: 0): IRect
  rect(slot_id: string): IRect | undefined
  rect(slot_id: string | 0 = 0): IRect | undefined {
    return this.find(slot_id)?.rect;
  }


  w(slot_id?: 0): number;
  w(slot_id: string): number | undefined;
  w(slot_id: string, or: number): number;
  w(slot_id: string | 0 = 0, or?: number): number | undefined {
    return this.rect(slot_id as any)?.w ?? or;
  }


  weight(slot_id?: 0): number
  weight(slot_id: string): number | undefined
  weight(slot_id: string | 0 = 0): number | undefined {
    return this.find(slot_id)?.weight;
  }
  readonly slot: ISlot;
  readonly slots: ReadonlyMap<string, ISlot>;
  constructor(slot: ISlot) {
    this.slot = slot;
    const slots = this.slots = new Map<string, ISlot>();
    const _job = (s: ISlot) => {
      slots.set(s.id, s);
      s.children.forEach(_job);
    };
    _job(slot);
  }
  find(slot_id: string | 0): ISlot | undefined {
    if (slot_id === 0) return this.slot;
    return this.slots.get(slot_id);
  }
}
