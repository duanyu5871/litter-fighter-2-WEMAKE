import { IEntityInfo } from "./IEntityInfo";
export interface IWeaponInfo extends IEntityInfo {
  weapon_hp: number;
  type: number;
}