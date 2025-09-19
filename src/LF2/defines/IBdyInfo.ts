import type { TAction } from "./Action";
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
}

export const BdyKeyOrders: Record<keyof IBdyInfo, number> = {
  kind: 0,
  kind_name: 1,
  x: 2,
  y: 3,
  w: 4,
  h: 5,
  z: 6,
  l: 7,
  hit_flag: 8,
  prefab_id: 9,
  actions: 10,
  test: 11,
  tester: 9998,
  indicator_info: 9999,
}