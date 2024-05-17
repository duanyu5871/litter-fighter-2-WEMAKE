import { IRect } from "./IRect";
import { IRectPair } from "./IRectPair";

export interface IBdyInfo extends IRect{
  friendly_fire?: number;
  kind: number;
  indicator_info?: IRectPair;
}
