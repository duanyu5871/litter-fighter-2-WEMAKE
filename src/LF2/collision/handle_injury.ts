import { ICollision } from "../base";
import { round } from "../utils";

export function handle_injury(c: ICollision, scale: number = 1) {
  const { itr, victim, attacker } = c;
  if (!itr.injury) return;
  const injury = round(itr.injury * scale);
  if (injury) {
    victim.hp -= injury;
    victim.hp_r -= round(injury * (1 - victim.world.hp_recoverability));
  }
  attacker.add_damage_sum(injury);
  // 分身击杀则不计算
  if (!victim.emitter && victim.hp <= 0) attacker.add_kill_sum(1);
}
