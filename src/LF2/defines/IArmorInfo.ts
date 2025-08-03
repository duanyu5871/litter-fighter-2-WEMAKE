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
   * @type {?number}
   * @memberof IArmorInfo
   */
  fireproof?: number;

  /**
   * 护甲是否防冻结
   * 
   * @type {?number}
   * @memberof IArmorInfo
   */
  antifreeze?: number;

  toughness: number;

  type: ArmorEnum | string; // hp? times? fall? defend?

  fall_value?: number;

  defend_value?: number;
}

