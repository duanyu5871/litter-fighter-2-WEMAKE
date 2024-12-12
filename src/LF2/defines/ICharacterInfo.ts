import { IEntityInfo } from "./IGameObjInfo";
export interface IArmorInfo {
  hit_sound?: string;
  fireproof?: number;
  antifreeze?: number;
  toughness: number;
  type: string; // hp? times? fall? defend?
}
export interface ICharacterInfo extends IEntityInfo {
  ce?: number;
  armor?: IArmorInfo;
  /** 角色头像 */
  head: string;
  /** 角色缩略图 */
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
