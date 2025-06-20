import { TAction } from "./Action";
import { TAllyFlag } from "./AllyFlag";
import type { IExpression } from "./IExpression";
import type { IQube } from "./IQube";
import type { IQubePair } from "./IQubePair";


export interface IBdyInfo extends IQube {
  /**
   * 预制信息id
   *
   * @type {?string}
   */
  prefab_id?: string;

  /**
   * [WEMAKE]
   * 
   * @type {TAllyFlag}
   */
  ally_flags: TAllyFlag;

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
