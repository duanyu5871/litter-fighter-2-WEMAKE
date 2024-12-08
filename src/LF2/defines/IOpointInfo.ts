import { TNextFrame } from ".";
export interface IOpointInfo {
  x: number;
  y: number;
  oid: string;
  action: TNextFrame;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  multi?: number;
  max_hp?: number;
  hp?: number;
  max_mp?: number;
  mp?: number;
}
