import { EntityEnum } from "./EntityEnum";
import { IBgData } from "./IBgData";
import { IEntityData } from "./IEntityData";


export interface IDataMap {
  'background': IBgData;
  [EntityEnum.Character]: IEntityData;
  [EntityEnum.Weapon]: IEntityData;
  [EntityEnum.Ball]: IEntityData;
  [EntityEnum.Entity]: IEntityData;
}
