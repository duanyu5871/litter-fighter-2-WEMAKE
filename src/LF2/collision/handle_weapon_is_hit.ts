import { ICollision } from "../base";
import { Defines, W_T } from "../defines";
import { floor } from "../utils";
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

  const weight = victim.data.base.weight || 1;
  const vx = floor((itr.dvx ? itr.dvx * attacker.facing : 0) / weight);
  const vy = floor((itr.dvy ? itr.dvy : Defines.DEFAULT_IVY_D) / weight);

  if (victim.data.base.type !== W_T.Heavy || is_fly) {
    victim.velocity_0.x = vx;
    victim.velocity_0.y = vy;
    victim.team = attacker.team;
    victim.next_frame = { id: victim.lf2.random_get(victim.data.indexes?.in_the_skys) };

  }
}
