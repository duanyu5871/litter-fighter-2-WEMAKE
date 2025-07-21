import { ICollision } from "../base";
import { WeaponType } from "../defines";

export function handle_itr_kind_pick_secretly(collision: ICollision): void {
  const { victim, attacker } = collision;
  if (attacker.holding || victim.data.base.type === WeaponType.Heavy) return;
  victim.holder = attacker;
  attacker.holding = victim;
  victim.team = attacker.team;
}
