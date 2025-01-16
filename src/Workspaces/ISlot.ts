
import { IRect } from "./IRect";

export interface ISlot {
  id: string;
  type: 'v' | 'h';
  parent: ISlot | null;
  rect: IRect;
  weight: number;
  children: ISlot[]
}
