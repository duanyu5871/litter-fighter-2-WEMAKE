import { EntityEnum } from "./EntityEnum";

/**
 * 队伍判定flag
 */
export enum HitFlag {
  Enemy = 0b000001,
  Ally = 0b000010,
  Ohters = EntityEnum.Entity,
  Fighter = EntityEnum.Fighter,
  Weapon = EntityEnum.Weapon,
  Ball = EntityEnum.Ball,
  AllType = HitFlag.Ohters | HitFlag.Fighter | HitFlag.Weapon | HitFlag.Ball,
  AllEnemy /*     */ = HitFlag.AllType | HitFlag.Enemy,
  AllAlly /*      */ = HitFlag.AllType | HitFlag.Ally,
  AllBoth /*      */ = HitFlag.AllType | HitFlag.Enemy | HitFlag.Ally,
}
export const hit_flag_name = (v: any) => HitFlag[v] ?? `unknown_${v}`;
export const hit_flag_full_name = (v: any) => `AllyFlag.${hit_flag_name(v)}`
export const hit_flag_desc = (v: any) => hit_flag_desc_map[v as HitFlag] || hit_flag_full_name(v)
export const hit_flag_desc_map: Record<HitFlag, string> = {
  [HitFlag.AllEnemy]: "判定全类型敌人",
  [HitFlag.AllAlly]: "判定全类型队友",
  [HitFlag.AllBoth]: "判定全类型敌人与队友",
  [HitFlag.Fighter]: "Fighter",
  [HitFlag.Weapon]: "Weapon",
  [HitFlag.Ball]: "Ball",
  [HitFlag.Ohters]: "Ohters",
  [HitFlag.AllType]: "全类型",
  [HitFlag.Enemy]: "敌人",
  [HitFlag.Ally]: "队友",
}
const descs: any = hit_flag_desc_map;
for (const key in descs) {
  descs[key] = descs[key] || hit_flag_full_name(key)
}
