import { IEntityInfo } from "./IEntityInfo";
export interface IArmorInfo {
  /**
   * 护甲被击中的声音
   */
  hit_sounds?: string[];

  /**
   * 护甲被击破的声音
   *
   * @type {?string[]}
   */
  dead_sounds?: string[];

  /**
   * 护甲是否防火烧
   */
  fireproof?: number;

  /**
   * 护甲是否防冻结
   */
  antifreeze?: number;

  toughness: number;

  type: string; // hp? times? fall? defend?
}

export interface ICharacterInfo extends IEntityInfo {
  armor?: IArmorInfo;
  /**
   * 
   */
  jump_height?: number;
  jump_distance?: number;
  jump_distancez?: number;
  dash_height?: number;
  dash_distance?: number;
  dash_distancez?: number;
  rowing_height?: number;
  rowing_distance?: number;
}
