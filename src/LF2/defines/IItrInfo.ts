import { TNextFrame } from ".";
import { IRect } from "./IRect";
import { IRectPair } from "./IRectPair";

export interface IItrInfo extends IRect{
  /** 友军伤害：0=关闭（默认），1=开启，*/
  friendly_fire?: number;
  /** 命中后，自己停顿多少帧，默认是4 */
  motionless?: number;
  /** 命中后，目标停顿多少帧（伴随震动），默认是4 */
  shaking?: number;
  kind: number;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  fall?: number;
  vrest?: number;
  arest?: number;
  bdefend?: number;
  injury?: number;
  effect?: number;
  indicator_info?: IRectPair;
  catchingact?: TNextFrame,
  caughtact?: TNextFrame
}
