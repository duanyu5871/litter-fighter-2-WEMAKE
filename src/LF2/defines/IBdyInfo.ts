import { TNextFrame } from ".";
import Defines from "./defines";
import { IRect } from "./IRect";
import { IRectPair } from "./IRectPair";

export interface IBdyInfo extends IRect {
  /**
   * 预制信息id
   * 
   * @see {?string}
   */
  prefab_id?: string;

  /**
   * [WEMAKE]
   * 是否判定同队Itr
   * 0=关闭（默认），1=开启
   * 
   * @type {?number}
   */
  friendly_fire?: number;

  /**
   * [LF2][WEMAKE]
   * @see {Defines.BdyKind}
   *
   * @type {number}
   */
  kind: number;

  /**
   * [WEMAKE]
   *
   * @type {?IRectPair}
   */
  indicator_info?: IRectPair;

  hit_act?: TNextFrame;

  break_act?: TNextFrame;

  hit_sounds: string[];
}
