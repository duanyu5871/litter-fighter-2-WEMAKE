import { ItrKind } from "../defines";
import { BdyKind } from "../defines/BdyKind";
import { EntityEnum } from "../defines/EntityEnum";
import { ICollision } from "./ICollision";

export interface ICollisionHandler {
  a_type: EntityEnum[];
  itr: ItrKind[];
  v_type: EntityEnum[];
  bdy: BdyKind[];
  run(collision: ICollision): any;
}
