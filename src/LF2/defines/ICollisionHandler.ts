import { ItrKind } from ".";
import { BdyKind } from "./BdyKind";
import { EntityEnum } from "./EntityEnum";
import { ICollision } from "./ICollision";

export interface ICollisionHandler {
  a_type: EntityEnum[];
  itr: ItrKind[];
  v_type: EntityEnum[];
  bdy: BdyKind[];
  run(collision: ICollision): any;
}
