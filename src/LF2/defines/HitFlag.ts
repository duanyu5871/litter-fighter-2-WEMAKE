/**
 * 队伍判定flag
 */
export enum HitFlag {
    /** 敌人 */ Enemy /*     */ = 0b111101,
    /** 队友 */ Ally /*      */ = 0b111110,
    /**      */ Both /*      */ = 0b111111,
    /**      */ Fighter /*   */ = 0b000100,
    /**      */ Weapon /*    */ = 0b001000,
    /**      */ Ball /*      */ = 0b010000,
    /**      */ Ohters /*    */ = 0b100000
}
