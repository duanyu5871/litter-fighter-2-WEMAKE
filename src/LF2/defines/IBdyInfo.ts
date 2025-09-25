import type { TAction } from "./TAction";
import { BdyKind } from "./BdyKind";
import { HitFlag } from "./HitFlag";
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
   * @type {HitFlag}
   */
  hit_flag: HitFlag | number;

  /**
   * [LF2][WEMAKE]
   * @see {BdyKind}
   *
   * @type {number}
   */
  kind: number | BdyKind;

  kind_name?: string;

  /**
   * [WEMAKE]
   *
   * @type {?IQubePair}
   */
  indicator_info?: IQubePair;

  actions?: TAction[];

  test?: string;

  tester?: IExpression<any>;
  code?: string | number,
}

let order = -1;
export const BdyKeyOrders: Record<keyof IBdyInfo, number> = {
  code: ++order,
  kind: ++order,
  kind_name: ++order,
  x: ++order,
  y: ++order,
  w: ++order,
  h: ++order,
  z: ++order,
  l: ++order,
  hit_flag: ++order,
  prefab_id: ++order,
  actions: ++order,
  test: ++order,
  tester: ++order,
  indicator_info: ++order,
}