import { IGameObjInfo } from ".";

export interface ICharacterInfo extends IGameObjInfo {
  name: string;
  head: string;
  small: string;
  jump_height: number;
  jump_distance: number;
  jump_distancez: number;
  dash_height: number;
  dash_distance: number;
  dash_distancez: number;
  rowing_height: number;
  rowing_distance: number;
}
