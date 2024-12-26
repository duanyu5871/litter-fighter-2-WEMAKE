import type { TNextFrame } from ".";
import type { IExpression } from "../base/Expression";
import { ICollision } from "../entity/ICollision";
import type { IQube } from "./IQube";
import type { IQubePair } from "./IQubePair";

export interface IBdyInfo extends IQube {
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
   * @type {?IQubePair}
   */
  indicator_info?: IQubePair;

  hit_act?: TNextFrame;

  break_act?: TNextFrame;

  hit_sounds: string[];

  test?: string;

  tester?: IExpression<ICollision>;
}
