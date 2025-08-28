import { ICollision } from "../base";
import { Defines, WeaponType } from "../defines";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";

export function handle_weapon_is_hit(collision: ICollision): void {
  handle_rest(collision)
  handle_stiffness(collision)
  handle_injury(collision)
  const { itr, attacker, victim, a_cube, b_cube } = collision;

  if (itr.bdefend && itr.bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) {
    victim.hp = victim.hp_r = 0;
  }

  const is_fly = itr.fall && itr.fall >= Defines.DEFAULT_FALL_VALUE_CRITICAL;
  const spark_frame_name = is_fly ? "slient_critical_hit" : "slient_hit";
  victim.world.spark(...collision.victim.spark_point(a_cube, b_cube), spark_frame_name);
  victim.data.base.hit_sounds

  if (victim.data.base.type === WeaponType.Heavy) {
    if (is_fly) {
      const vx = itr.dvx ? itr.dvx * attacker.facing : 0;
      const vy = itr.dvy ? itr.dvy : 3;
      victim.velocity_0.x = vx;
      victim.velocity_0.y = vy;
      victim.team = attacker.team;
      victim.next_frame = { id: victim.data.indexes?.in_the_sky };
    }
  } else {
    const vx = itr.dvx ? itr.dvx * attacker.facing : 0;
    const vy = itr.dvy ? itr.dvy : 3;
    victim.velocity_0.x = vx;
    victim.velocity_0.y = vy;
    victim.team = attacker.team;
    victim.next_frame = { id: victim.data.indexes?.in_the_sky };
  }
}
