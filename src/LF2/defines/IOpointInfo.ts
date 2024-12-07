import { TNextFrame } from ".";
export interface IOpointInfo {
  x: number;
  y: number;
  oid: number;
  action: TNextFrame;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  multi?: number;
}
