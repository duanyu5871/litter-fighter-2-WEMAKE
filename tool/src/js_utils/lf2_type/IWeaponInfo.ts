import { IGameObjInfo } from ".";

export interface IWeaponInfo extends IGameObjInfo {
  weapon_hp: number;
  type: number;
  name: string;
  weapon_drop_hurt?: number;
  weapon_hit_sound?: string;
  weapon_drop_sound?: string;
  weapon_broken_sound?: string;
  bounce: number;
}