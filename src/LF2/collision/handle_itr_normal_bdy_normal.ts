import { ICollision } from "../base";
import { Defines, ItrEffect, SparkEnum, StateEnum } from "../defines";
import { is_character, same_face, turn_face } from "../entity";
import { handle_itr_kind_freeze } from "./handle_itr_kind_freeze";
import { handle_fall, take_injury } from "./handle_fall";
import { is_armor_work } from "./is_armor_work";

export function handle_itr_normal_bdy_normal(collision: ICollision) {
  if (is_armor_work(collision)) return;
  const { itr, attacker, victim, a_cube, b_cube } = collision;
  attacker.motionless = itr.motionless ?? collision.victim.world.itr_motionless;
  victim.shaking = (itr.shaking ?? collision.attacker.world.itr_shaking) * 2;
  switch (itr.effect) {
    case ItrEffect.Fire:
    case ItrEffect.MFire1:
    case ItrEffect.MFire2:
    case ItrEffect.FireExplosion: {
      take_injury(itr, victim, attacker);
      victim.toughness = 0;
      victim.fall_value = 0;
      victim.defend_value = 0;
      victim.velocity_0.y = (itr.dvy ?? attacker.world.ivy_d) * attacker.world.ivy_f;
      victim.velocity_0.z = 0;
      const direction = ItrEffect.FireExplosion === itr.effect
        ? victim.position.x > attacker.position.x
          ? -1
          : 1
        : attacker.facing;
      victim.velocity_0.x = (itr.dvx || 0) * direction;
      if (victim.data.indexes?.fire)
        victim.next_frame = {
          id: victim.data.indexes.fire[0],
          facing: turn_face(attacker.facing),
        };
      break;
    }
    case ItrEffect.Ice2:
      handle_itr_kind_freeze(collision)
      break;
    case ItrEffect.Ice: {
      if (victim.frame.state === StateEnum.Frozen) {
        take_injury(itr, victim, attacker);
        handle_fall(collision);
      } else {
        handle_itr_kind_freeze(collision)
      }
      break;
    }
    case ItrEffect.Explosion:
    case ItrEffect.Normal:
    case ItrEffect.Sharp:
    case void 0: {
      const { fall = Defines.DEFAULT_ITR_FALL } = itr;
      take_injury(itr, victim, attacker);
      victim.fall_value -= fall;
      victim.defend_value = 0;
      const is_fall = victim.fall_value <= 0 ||
        victim.hp <= 0 ||
        victim.frame.state === StateEnum.Frozen ||
        (victim.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY &&
          (StateEnum.Caught === victim.frame.state ||
            victim.velocity_0.y > 0 ||
            victim.position.y > 0));
      if (is_fall) {
        handle_fall(collision);
      } else {
        if (itr.dvx) victim.velocity_0.x = itr.dvx * attacker.facing;
        if (victim.position.y > 0 && victim.velocity_0.y > 2)
          victim.velocity_0.y = 2;
        victim.velocity_0.z = 0;

        const [x, y, z] = victim.spark_point(a_cube, b_cube)
        if (itr.effect === ItrEffect.Sharp) {
          victim.world.spark(x, y, z, SparkEnum.Bleed);
        } else if (is_character(victim)) {
          victim.world.spark(x, y, z, SparkEnum.Hit);
        }
        if (StateEnum.Caught === victim.frame.state) {
          if (victim.frame.cpoint) {
            const { backhurtact, fronthurtact } = victim.frame.cpoint;
            if (attacker.facing === victim.facing && backhurtact) {
              victim.next_frame = { id: backhurtact };
            } else if (attacker.facing !== victim.facing && fronthurtact) {
              victim.next_frame = { id: fronthurtact };
            }
          }
        } else {
          /* 击晕 */
          if (victim.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY) {
            victim.next_frame = { id: victim.data.indexes?.dizzy };
          } else if (victim.data.indexes?.grand_injured) {
            /* 击中 */
            victim.next_frame = {
              id: victim.data.indexes.grand_injured[same_face(victim, attacker)][0],
            };
          }
        }
      }
      break;
    }
  }
}

