import type { IExpression } from "./IExpression";
import type { IQube } from "./IQube";
import type { IQubePair } from "./IQubePair";
import type { TAction, TNextFrame } from "./js";
import { TAllyFlag } from "./AllyFlag";
import type { Defines } from "./defines";

export type DEFAULT_ITR_MOTIONLESS = typeof Defines.DEFAULT_ITR_MOTIONLESS

export interface IItrInfo extends IQube {
  /**
   * 预制信息id
   *
   * @see {?string}
   */
  prefab_id?: string;

  /**
   *
   * @type {TAllyFlag}
   */
  ally_flags: TAllyFlag;

  /**
   * 自身停顿值
   * - 命中后，自己停顿多少帧
   * - 不设置时存在默认值，见Defines.DEFAULT_ITR_MOTIONLESS
   *
   * @see {Defines.DEFAULT_ITR_MOTIONLESS}
   */
  motionless?: number;

  /**
   * 目标停顿值
   * - 命中后，目标停顿多少帧（伴随震动）
   * - 不设置时存在默认值，见Defines.DEFAULT_ITR_MOTIONLESS
   *
   * @see {Defines.DEFAULT_ITR_SHAKING}
   */
  shaking?: number;

  /**
   * 本itr的效果类型
   * 详细效果见ItrKind
   * @see {ItrKind}
   */
  kind?: number;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  fall?: number;
  vrest?: number;
  arest?: number;

  /**
   * 破防值
   *
   * “防御状态”下的“受击目标”，击中时，其“格挡值”将被减去“破防值”，
   * 若“格挡值”小于0，“受击目标”将进入“破防动作”。
   *
   * 若非“防御状态”下的“受攻目标”存在“强硬值”，击中时，其“强硬值”将被减去“破防值”，
   * 若“强硬值”小于0，“受攻目标”被击中。
   */
  bdefend?: number;

  /** 伤害值 */
  injury?: number;

  /**
   * @see {ItrEffect}
   */
  effect?: number;
  indicator_info?: IQubePair;
  catchingact?: TNextFrame;
  caughtact?: TNextFrame;

  /** 命中后，自己跳转至什么帧 */
  // hit_act?: TNextFrame;
  // hit_sounds?: string[];
  actions?: TAction[];

  test?: string;
  tester?: IExpression<any>;
}
