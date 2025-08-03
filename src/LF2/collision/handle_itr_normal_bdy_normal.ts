import { ICollision } from "../base";
import { ArmorEnum, Defines, ItrEffect, SparkEnum, StateEnum } from "../defines";
import { is_character, same_face, turn_face } from "../entity";
import { handle_itr_kind_freeze } from "./handle_itr_kind_freeze";
import { handle_fall, take_injury } from "./handle_itr_kind_normal";

export function handle_itr_normal_bdy_normal(collision: ICollision) {
  if (is_armor_work(collision)) return;
  const { itr, attacker, victim, a_cube, b_cube } = collision;
  switch (itr.effect) {
    case ItrEffect.Fire:
    case ItrEffect.MFire1:
    case ItrEffect.MFire2:
    case ItrEffect.FireExplosion: {
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

export function is_armor_work(collision: ICollision): boolean {
  const { victim } = collision;
  const { armor } = victim;

  if (!armor || victim.toughness <= 0) return false;

  const { itr } = collision;
  const { effect } = itr
  if (!armor.fireproof && (
    effect === ItrEffect.Fire ||
    effect === ItrEffect.MFire1 ||
    effect === ItrEffect.MFire2 ||
    effect === ItrEffect.FireExplosion
  )) return false;

  if (!armor.antifreeze && (
    effect === ItrEffect.Ice2 ||
    effect === ItrEffect.Ice
  )) return false

  const { bdefend = Defines.DEFAULT_BREAK_DEFEND_VALUE } = itr;
  if (bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) return false;

  const { a_cube, b_cube } = collision;
  const { fall_value_max } = victim
  const { type, hit_sounds, dead_sounds = hit_sounds } = armor;
  const { fall = Defines.DEFAULT_ITR_FALL } = itr;
  let decrease_value = 0;
  switch (type) {
    case ArmorEnum.Fall: decrease_value = fall; break;
    case ArmorEnum.Defend: decrease_value = bdefend; break;
  }
  victim.toughness -= decrease_value;
  const [x, y, z] = victim.spark_point(a_cube, b_cube)
  const spark_type = fall >= fall_value_max - Defines.DEFAULT_FALL_VALUE_DIZZY ?
    SparkEnum.SlientCriticalHit :
    SparkEnum.SlientHit
  victim.world.spark(x, y, z, spark_type);
  const sounds = victim.toughness > 0 ? hit_sounds : dead_sounds;
  if (sounds) for (const s of sounds) victim.lf2.sounds.play(s, x, y, z)
  return true;
}