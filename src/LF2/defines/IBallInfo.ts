import { IEntityInfo } from "./IGameObjInfo";

export interface IBallInfo extends IEntityInfo {
  weapon_hit_sound?: string;
  weapon_drop_sound?: string;
  weapon_broken_sound?: string;
}
