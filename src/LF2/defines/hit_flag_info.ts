import { HitFlag } from "./HitFlag";

export const hit_flag_name = (v: any) => HitFlag[v] ?? `unknown_${v}`;
export const hit_flag_full_name = (v: any) => `AllyFlag.${hit_flag_name(v)}`
export const hit_flag_desc = (v: any) => hit_flag_desc_map[v as HitFlag] || hit_flag_full_name(v)
export const hit_flag_desc_map: Record<HitFlag, string> = {
  [HitFlag.Enemy]: "仅判定敌人",
  [HitFlag.Ally]: "仅判定队友",
  [HitFlag.Both]: "判定敌人与队友",
  [HitFlag.Fighter]: "Fighter",
  [HitFlag.Weapon]: "Weapon",
  [HitFlag.Ball]: "Ball",
  [HitFlag.Ohters]: "Ohters"
}
const descs: any = hit_flag_desc_map;
for (const key in descs) {
  descs[key] = descs[key] || hit_flag_full_name(key)
}
