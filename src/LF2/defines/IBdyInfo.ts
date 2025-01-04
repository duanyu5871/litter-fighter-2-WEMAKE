import { TAction } from "./Action";
import type { IExpression } from "./IExpression";
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
   * - 0: 仅判定敌人（默认）
   * - 1: 判定队友与敌人
   * - 2: 仅判定队友
   * 
   * @type {?number}
   */
  ally_flags?: number;

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

  actions?: TAction[];

  test?: string;

  tester?: IExpression<any>;
}
