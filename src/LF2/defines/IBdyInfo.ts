import type { TNextFrame } from ".";
import type { Defines } from "./defines";
import type { IRect } from "./IRect";
import type { IRectPair } from "./IRectPair";

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
   * @see {BdyKind}
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

  /**
   * 若存在此值，则该bdy只允许被目标组的itr命中
   * 
   * @see {Defines.EntityGroup}
   */
  itr_groups?: string[];
}
