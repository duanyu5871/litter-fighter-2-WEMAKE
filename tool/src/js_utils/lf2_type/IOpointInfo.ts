import { TNextFrame } from ".";

export interface IOpointInfo {
  kind: number;
  x: number;
  y: number;
  action: TNextFrame;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  oid: number;
  facing: number;
}
