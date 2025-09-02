import type { ArmorEnum } from "./ArmorEnum";

export interface IArmorInfo {
  /**
   * 护甲被击中的声音
   * 
   * @type {?string[]}
   * @memberof IArmorInfo
   */
  hit_sounds?: string[];

  /**
   * 护甲被击破的声音
   *
   * @type {?string[]}
   * @memberof IArmorInfo
   */
  dead_sounds?: string[];

  /**
   * 护甲是否防火烧
   * 
   * 默认为false
   * 
   * @type {?number}
   * @memberof IArmorInfo
   */
  fireproof?: number;

  /**
   * 护甲是否防冻结
   * 
   * 默认为false
   * 
   * @type {?number}
   * @memberof IArmorInfo
   */
  antifreeze?: number;

  fulltime?: boolean;

  /** 
   * 通过什么值来扣除toughness 
   * 
   * @type {ArmorEnum | string}
   * @memberof IArmorInfo
   */
  type: ArmorEnum | string;

  toughness: number;

  /**
   * 受伤比例
   * 默认: 0.1
   *
   * @type {number}
   * @memberof IArmorInfo
   */
  injury_ratio?: number;

  /**
   * 硬直比例
   * 默认: 3
   *
   * @type {number}
   * @memberof IArmorInfo
   */
  shaking_ratio?: number;

  
  motionless_ratio?: number;
}

