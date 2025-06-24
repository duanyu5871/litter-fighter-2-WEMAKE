import { EntityEnum } from "./EntityEnum";
import type { IBgData } from "./IBgData";
import type { IEntityData } from "./IEntityData";

export interface IDataMap {
  background: IBgData;
  [EntityEnum.Character]: IEntityData;
  [EntityEnum.Weapon]: IEntityData;
  [EntityEnum.Ball]: IEntityData;
  [EntityEnum.Entity]: IEntityData;
}
