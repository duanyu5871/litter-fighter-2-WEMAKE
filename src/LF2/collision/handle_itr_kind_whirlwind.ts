import { Defines } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { ICollision } from "../defines/ICollision";

export function handle_itr_kind_whirlwind(c: ICollision) {
  const { attacker, victim } = c;
  victim.merge_velocities();
  let { x, y, z } = victim.velocities[0];
  const dz = Math.round(victim.position.z - attacker.position.z);
  const dx = Math.round(victim.position.x - attacker.position.x);
  let d = dx > 0 ? -1 : 1;
  let l = dz > 0 ? -1 : dz < 0 ? 1 : 0;
  y += y < 4 ? 1 : -1;
  x += d * 0.5;
  z += l * 0.5;
  victim.velocities[0].set(x, y, z);
  switch (victim.type) {
    case EntityEnum.Weapon:
      switch (victim.frame.state) {
        case Defines.State.Weapon_InTheSky:
        case Defines.State.HeavyWeapon_InTheSky:
          break;
        default:
          victim.next_frame = { id: victim.data.indexes?.in_the_sky };
          break;
      }
      break;
  }
}
