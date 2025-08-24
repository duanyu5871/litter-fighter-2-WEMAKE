import { ICollision } from "../base";
import { Defines, SparkEnum, StateEnum } from "../defines";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";


export function handle_ball_is_hit(collision: ICollision): void {
  const { victim, attacker, itr, a_cube, b_cube } = collision;
  handle_rest(collision);
  handle_injury(collision);
  handle_stiffness(collision);
  if (itr.bdefend && itr.bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) {
    victim.hp = victim.hp_r = 0;
  }
  victim.shaking = 0;
  victim.velocities.length = 1;
  victim.velocity_0.x = 0;
  victim.velocity_0.z = 0;
  victim.velocity_0.y = 0;
  switch (victim.frame.state) {
    case StateEnum.Ball_Flying:
    case StateEnum.Ball_Rebounding:
      victim.team = attacker.team;
      break;
  }

  victim.world.spark(...victim.spark_point(a_cube, b_cube),
    itr.fall && itr.fall > Defines.DEFAULT_FALL_VALUE_FLY ?
      SparkEnum.CriticalHit :
      SparkEnum.Hit
  );
  victim.play_sound(victim.data.base.hit_sounds)
}
