
import { IRect } from "./IRect";

export interface ISlot {
  id: string;
  type: 'v' | 'h';
  parent: ISlot | null;
  rect: IRect;
  weight: number;
  children: Readonly<ISlot[]>;
  prev: ISlot | null;
  next: ISlot | null;
}
