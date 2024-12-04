import { IRect } from "./IRect";
import { IRectPair } from "./IRectPair";

export interface IBdyInfo extends IRect {
  /**
   * 是否判定同队Itr
   * 
   * 0=关闭（默认），1=开启
   * 
   * @type {?number}
   */
  friendly_fire?: number;
  kind: number;
  indicator_info?: IRectPair;
}
