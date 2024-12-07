import { TNextFrame } from ".";
export interface IOpointInfo {
  x: number;
  y: number;
  action: TNextFrame;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  oid: number;
  multi?: number;
}
