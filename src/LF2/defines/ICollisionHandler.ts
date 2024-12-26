import { ItrKind } from ".";
import { BdyKind } from "./BdyKind";
import { ICollision } from "./ICollision";


export interface ICollisionHandler {
  itr: ItrKind[];
  bdy: BdyKind[];
  run(collision: ICollision): any;
}
