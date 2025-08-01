import { ICollision } from "../base";
import { WeaponType } from "../defines";

export function handle_itr_kind_pick(collision: ICollision): void {
  const { victim, attacker } = collision;
  if (attacker.holding) return;
  victim.holder = attacker;
  attacker.holding = victim;
  victim.team = attacker.team;
  if (victim.data.base.type === WeaponType.Heavy) {
    attacker.next_frame = { id: attacker.data.indexes?.picking_heavy };
  } else {
    attacker.next_frame = { id: attacker.data.indexes?.picking_light };
  }

}
