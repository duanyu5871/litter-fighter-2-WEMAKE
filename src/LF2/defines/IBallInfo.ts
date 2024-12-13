import { IEntityInfo } from "./IEntityInfo";

export interface IBallInfo extends IEntityInfo {
  weapon_hit_sound?: string;
  weapon_drop_sound?: string;
  weapon_broken_sound?: string;
}
