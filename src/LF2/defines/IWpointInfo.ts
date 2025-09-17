import { IQubePair } from "./IQubePair";

export interface IWpointInfo {
  kind: number;
  x: number;
  y: number;
  z?: number;
  weaponact: string;
  attacking?: string;
  cover: number;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  indicator_info?: IQubePair;
}
