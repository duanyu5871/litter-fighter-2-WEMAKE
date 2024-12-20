import { TNextFrame } from ".";


export interface ICpointInfo {
  kind: 1 | 2;
  x: number;
  y: number;
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
  cover: number;
  shaking?: number;

  /*dircontrol*/
}
