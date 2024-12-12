import { IGameObjInfo } from ".";

export interface IBallInfo extends IGameObjInfo {
  weapon_hit_sound?: string;
  weapon_drop_sound?: string;
  weapon_broken_sound?: string;
}
