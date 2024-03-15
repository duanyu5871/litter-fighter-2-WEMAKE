import { IGameObjInfo } from ".";

export interface IBallInfo extends IGameObjInfo {
  hp: number;
  weapon_hit_sound?: string;
  weapon_drop_sound?: string;
  weapon_broken_sound?: string;
}
