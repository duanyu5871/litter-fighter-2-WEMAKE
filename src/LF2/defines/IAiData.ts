import { IExpression } from "./IExpression";
import type { IFrameInfo } from "./IFrameInfo";
/** XZ射线检测 */
export interface IAiRay {
  x: number;
  z: number;
  min_x?: number;
  max_x?: number;
  min_z?: number;
  max_z?: number;
  min_d?: number;
}
export interface IAiRange {

  min?: number;
  max?: number;
}
export interface IAiAction {
  /** 欲望值，范围[0,10000] */
  desire?: number;

  /** XZ射线检测 */
  e_ray?: IAiRay[];

  /** 判定式 */
  expression?: string;

  judger?: IExpression<any>;
}
export interface IAiData {
  id?: string;
  states?: { [x in IFrameInfo['state']]: IAiAction[] };
  frames?: { [x in IFrameInfo['id']]: IAiAction[] };
}
