/**
 * 队伍判定flag
 */
export enum AllyFlag {
  /** 敌人 */
  Enemy = 0b01,
  /** 队友 */
  Ally  = 0b10,
  /** 敌人与队友 */
  Both  = 0b11,
}

export type TAllyFlag = AllyFlag | 0b01 | 0b10 | 0b11;