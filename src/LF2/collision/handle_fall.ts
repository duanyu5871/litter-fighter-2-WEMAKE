
import { ICollision } from "../base/ICollision";
import { ItrEffect, SparkEnum, TFace } from "../defines";
import { is_character } from "../entity/type_check";

export function handle_fall(collision: ICollision) {
  const { itr, attacker, victim, a_cube, b_cube } = collision;
  const aface: TFace =
    ItrEffect.Explosion === itr.effect
      ? victim.position.x > attacker.position.x
        ? -1
        : 1
      : attacker.facing;
  victim.fall_value = victim.fall_value_max;
  victim.defend_value = victim.defend_value_max;
  victim.resting = 0;
  victim.velocities.length = 1;
  victim.velocity_0.y =
    (itr.dvy ?? attacker.world.ivy_d) * attacker.world.ivy_f;
  victim.velocity_0.z = 0;
  victim.velocity_0.x = (itr.dvx || 0) * aface;
  if (itr.effect === ItrEffect.Sharp) {
    victim.world.spark(...victim.spark_point(a_cube, b_cube), SparkEnum.CriticalBleed);
  } else if (is_character(victim)) {
    victim.world.spark(...victim.spark_point(a_cube, b_cube), SparkEnum.CriticalHit);
  }
  const direction: TFace = victim.velocity_0.x / victim.facing >= 0 ? 1 : -1;
  if (victim.data.indexes?.critical_hit)
    victim.next_frame = { id: victim.data.indexes.critical_hit[direction][0] };
}
