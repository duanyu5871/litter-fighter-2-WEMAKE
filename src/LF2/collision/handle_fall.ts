
import { ICollision } from "../base/ICollision";
import { ItrEffect, SparkEnum, TFace } from "../defines";
import { turn_face } from "../entity";
import { is_character } from "../entity/type_check";

export function handle_fall(collision: ICollision) {
  const { itr, attacker, victim, a_cube, b_cube } = collision;
  const aface: TFace = (
    ItrEffect.FireExplosion === itr.effect || ItrEffect.Explosion === itr.effect
  ) ? (victim.position.x > attacker.position.x ? -1 : 1) : attacker.facing;

  victim.toughness = 0;
  victim.fall_value = 0;
  victim.defend_value = 0;
  victim.resting = 0;
  victim.velocities.length = 1;
  victim.velocity_0.y = (itr.dvy ?? attacker.world.ivy_d) * attacker.world.ivy_f;
  victim.velocity_0.z = 0;
  victim.velocity_0.x = (itr.dvx || 0) * aface;
  if (itr.effect === ItrEffect.Sharp) {
    victim.world.spark(...victim.spark_point(a_cube, b_cube), SparkEnum.CriticalBleed);
  } else if (is_character(victim)) {
    victim.world.spark(...victim.spark_point(a_cube, b_cube), SparkEnum.CriticalHit);
  }
  const direction: TFace = victim.velocity_0.x / victim.facing >= 0 ? 1 : -1;

  switch (itr.effect) {
    case ItrEffect.Fire:
    case ItrEffect.MFire1:
    case ItrEffect.MFire2:
    case ItrEffect.FireExplosion:
      if (victim.data.indexes?.fire)
        victim.next_frame = {
          id: victim.data.indexes.fire[0],
          facing: turn_face(aface),
        };
      break;
    default:
      if (victim.data.indexes?.critical_hit)
        victim.next_frame = { id: victim.data.indexes.critical_hit[direction][0] };
      break;
  }

}
