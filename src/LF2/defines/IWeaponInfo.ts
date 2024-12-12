import { IEntityInfo } from "./IGameObjInfo";
export interface IWeaponInfo extends IEntityInfo {
  weapon_hp: number;
  type: number;
  weapon_drop_hurt?: number;
  weapon_hit_sound?: string;
  weapon_drop_sound?: string;
  weapon_broken_sound?: string;
}