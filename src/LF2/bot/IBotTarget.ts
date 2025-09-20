import { Entity } from "../entity";


export interface IBotTarget {
  entity: Entity;
  distance: number;
  defendable: number;
}
