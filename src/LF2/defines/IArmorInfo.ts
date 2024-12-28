export interface IArmorInfo {
  /**
   * 护甲被击中的声音
   */
  hit_sounds?: string[];

  /**
   * 护甲被击破的声音
   *
   * @type {?string[]}
   */
  dead_sounds?: string[];

  /**
   * 护甲是否防火烧
   */
  fireproof?: number;

  /**
   * 护甲是否防冻结
   */
  antifreeze?: number;

  toughness: number;

  type: string; // hp? times? fall? defend?

  fall_value?: number;

  defend_value?: number;
}
