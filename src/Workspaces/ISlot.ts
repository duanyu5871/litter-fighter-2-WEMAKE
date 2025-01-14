
import { IRect } from "./IRect";
import { Slot } from "./Slot";

export interface ISlot {
  id?: string;
  t?: 'v' | 'h';
  p?: Slot | null;
  r?: Partial<IRect>;
  f?: number;
}
