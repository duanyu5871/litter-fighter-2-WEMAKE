import type { TNextFrame } from "./INextFrame";
import { IQubePair } from "./IQubePair";

export interface ICpointInfo {
  kind: 1 | 2;
  x: number;
  y: number;
  z: number;
  vaction?: TNextFrame;
  injury?: number;
  hurtable?: 0 | 1;
  decrease?: number;
  throwvx?: number;
  throwvy?: number;
  throwvz?: number;
  throwinjury?: number;
  fronthurtact?: string;
  backhurtact?: string;
  shaking?: number;

  tx?: number;
  ty?: number;
  tz?: number;

  /*dircontrol*/
  indicator_info?: IQubePair;
}
