
import { ICollision } from "../base/ICollision";
import { Defines, ItrEffect, SparkEnum, TFace } from "../defines";
import { turn_face } from "../entity";
import { is_character } from "../entity/type_check";

export function handle_fall(collision: ICollision) {
  const { itr, attacker, victim, a_cube, b_cube } = collision;

  const is_explosion = [ItrEffect.FireExplosion, ItrEffect.Explosion].some(v => v === itr.effect);
  const diff_x = victim.position.x - attacker.position.x
  let attacker_facing: TFace = -1;
  if (!is_explosion) attacker_facing = attacker.facing
  else if (diff_x > 0) attacker_facing = -1;
  else attacker_facing = 1;

  victim.toughness = 0;
  victim.fall_value = 0;
  victim.defend_value = 0;
  victim.resting = 0;
  victim.velocities.length = 1;
  victim.velocity_0.y = (itr.dvy ?? attacker.world.ivy_d) * attacker.world.ivy_f;
  victim.velocity_0.z = 0;
  victim.velocity_0.x = (itr.dvx || 0) * attacker_facing;

  const is_critical = !!(itr.fall && itr.fall > Defines.DEFAULT_FALL_VALUE_CRITICAL)

  const spark_pos = victim.spark_point(a_cube, b_cube);
  let effect = SparkEnum.Hit
  if (itr.effect === ItrEffect.Sharp && is_character(victim)) {
    effect = is_critical ? SparkEnum.CriticalBleed : SparkEnum.Bleed;
  } else {
    effect = is_critical ? SparkEnum.CriticalHit : SparkEnum.Hit;
  }
  victim.world.spark(...spark_pos, effect)

  const { fire, critical_hit } = victim.data.indexes || {}

  const normal_fall_act = () => {
    if (!critical_hit) return;
    const direction: TFace = victim.velocity_0.x / victim.facing >= 0 ? 1 : -1;
    victim.next_frame = { id: critical_hit[direction][0] };
  }

  switch (itr.effect) {
    case ItrEffect.Fire:
    case ItrEffect.MFire2:
      if (fire) {
        victim.next_frame = {
          id: fire[0],
          facing: turn_face(attacker_facing),
        };
      } else {
        normal_fall_act()
      }
      break;
    case ItrEffect.MFire1:
    case ItrEffect.FireExplosion:
      if (fire) {
        victim.next_frame = {
          id: fire[0],
          facing: attacker_facing,
        };
      } else {
        normal_fall_act()
      }
      break;
    default:
      normal_fall_act()
      break;
  }

}
