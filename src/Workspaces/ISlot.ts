
import { IRect } from "./IRect";
import { Slot } from "./Slot";

export interface ISlot {
  id?: string;
  type?: 'v' | 'h';
  parent?: Slot | null;
  rect?: Partial<IRect>;
  weight?: number;
}
