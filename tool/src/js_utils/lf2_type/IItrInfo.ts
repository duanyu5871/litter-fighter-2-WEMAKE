import { TFrameId } from ".";
import { ITexturePieceInfos } from "./ITexturePieceInfos";


export interface IItrInfo {
  /** 友军伤害：0=关闭（默认），1=开启，*/
  friendly_fire?: number;
  /** 命中后，自己停顿多少帧，默认是4 */
  motionless?: number;
  /** 命中后，目标停顿多少帧（伴随震动），默认是4 */
  shaking?: number;
  kind: number;
  x: number;
  y: number;
  w: number;
  h: number;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  fall?: number;
  vrest?: number;
  arest?: number;
  bdefend?: number;
  injury?: number;
  effect?: number;
  indicator_info?: ITexturePieceInfos;
  catchingact?: TFrameId,
  caughtact?: TFrameId
}
