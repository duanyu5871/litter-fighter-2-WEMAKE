/**
 * 队伍判定flag
 */
export enum AllyFlag {
  /** 敌人 */
  Enemy = 0b01,
  /** 队友 */
  Ally = 0b10,
  /** 敌人与队友 */
  Both = 0b11,
}

export type TAllyFlag = AllyFlag | 0b01 | 0b10 | 0b11;
export const ally_flag_name = (v: any) => AllyFlag[v] ?? `unknown_${v}`;
export const ally_flag_full_name = (v: any) => `AllyFlag.${ally_flag_name(v)}`
export const ally_flag_desc = (v: any) => AllyFlagDescriptions[v as AllyFlag] || ally_flag_full_name(v)
export const AllyFlagDescriptions: Record<AllyFlag, string> = {
  [AllyFlag.Enemy]: "仅判定敌人",
  [AllyFlag.Ally]: "仅判定队友",
  [AllyFlag.Both]: "判定敌人与队友"
}
const descs: any = AllyFlagDescriptions;
for (const key in descs) {
  descs[key] = descs[key] || ally_flag_full_name(key)
}
