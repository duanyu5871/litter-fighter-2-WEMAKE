import { TNextFrame } from ".";
import { IRect } from "./IRect";
import { IRectPair } from "./IRectPair";
import type { Defines } from "./defines";


export interface IItrInfo extends IRect {
  /**
   * 预制信息id
   * 
   * @see {?string}
   */
  prefab_id?: string,

  /**
   * 是否判定同队Bdy
   * 
   * 0=关闭（默认），1=开启
   * 
   * @type {?number}
   */
  friendly_fire?: number;

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
   * @see {Defines.DEFAULT_ITR_SHAKEING}
   */
  shaking?: number;



  /**
   * 本itr的效果类型
   * 详细效果见Defines.ItrKind
   * @see {Defines.ItrKind}
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
   * @see {Defines.ItrEffect}
   */
  effect?: number;
  indicator_info?: IRectPair;
  catchingact?: TNextFrame,
  caughtact?: TNextFrame

  /** 命中后，自己跳转至什么帧 */
  hit_act?: TNextFrame;
  hit_sounds?: string[];
}

