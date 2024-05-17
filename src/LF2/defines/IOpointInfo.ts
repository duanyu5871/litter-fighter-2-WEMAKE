import { TNextFrame } from ".";
import type { Defines } from "./defines";
export interface IOpointInfo {
  kind: number;
  x: number;
  y: number;
  action: TNextFrame;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  oid: number;

  /** @type {Defines.FacingFlag} */
  facing: number;

  multi: number;
}
