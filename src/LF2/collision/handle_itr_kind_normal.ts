import { Defines, ItrEffect, ItrKind, TFace } from "../defines";
import { BdyKind } from "../defines/BdyKind";
import { ICollision } from "../defines/ICollision";
import { same_face, turn_face } from "../entity/face_helper";
import { is_character } from "../entity/type_check";
import { collisions_keeper } from "./CollisionKeeper";

function fall(collision: ICollision) {
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
  victim.velocities[0].y =
    (itr.dvy ?? attacker.world.ivy_d) * attacker.world.ivy_f;
  victim.velocities[0].z = 0;
  victim.velocities[0].x = (itr.dvx || 0) * aface;
  if (itr.effect === ItrEffect.Sharp) {
    victim.world.spark(...victim.spark_point(a_cube, b_cube), "critical_bleed");
  } else if (is_character(victim)) {
    victim.world.spark(...victim.spark_point(a_cube, b_cube), "critical_hit");
  } else {
    victim.world.spark(
      ...victim.spark_point(a_cube, b_cube),
      "slient_critical_hit",
    );
  }
  const direction: TFace = victim.velocities[0].x / victim.facing >= 0 ? 1 : -1;
  if (victim.data.indexes?.critical_hit)
    victim.next_frame = { id: victim.data.indexes.critical_hit[direction][0] };
}
export function handle_itr_kind_normal(collision: ICollision) {
  const { itr, attacker, victim, a_cube, b_cube } = collision;
  switch (itr.effect) {
    case ItrEffect.Fire:
    case ItrEffect.MFire1:
    case ItrEffect.MFire2:
    case ItrEffect.FireExplosion: {
      victim.fall_value = 0;
      victim.defend_value = 0;
      victim.velocities[0].y =
        (itr.dvy ?? attacker.world.ivy_d) * attacker.world.ivy_f;
      victim.velocities[0].z = 0;
      const direction =
        ItrEffect.FireExplosion === itr.effect
          ? victim.position.x > attacker.position.x
            ? -1
            : 1
          : attacker.facing;
      victim.velocities[0].x = (itr.dvx || 0) * direction;
      if (victim.data.indexes?.fire)
        victim.next_frame = {
          id: victim.data.indexes.fire[0],
          facing: turn_face(attacker.facing),
        };
      break;
    }
    case ItrEffect.Ice2:
      collisions_keeper.get(
        attacker.type,
        ItrKind.Freeze,
        victim.type,
        BdyKind.Normal,
      )?.(collision);
      break;
    case ItrEffect.Ice: {
      if (victim.frame.state === Defines.State.Frozen) {
        fall(collision);
      } else {
        collisions_keeper.get(
          attacker.type,
          ItrKind.Freeze,
          victim.type,
          BdyKind.Normal,
        )?.(collision);
      }
      break;
    }
    case ItrEffect.Explosion:
    case ItrEffect.Normal:
    case ItrEffect.Sharp:
    case void 0: {
      victim.fall_value -= itr.fall ? itr.fall : Defines.DEFAULT_ITR_FALL;
      victim.defend_value = 0;
      const is_fall =
        victim.fall_value <= 0 ||
        victim.hp <= 0 ||
        victim.frame.state === Defines.State.Frozen ||
        (victim.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY &&
          (Defines.State.Caught === victim.frame.state ||
            victim.velocities[0].y > 0 ||
            victim.position.y > 0));
      if (is_fall) {
        fall(collision);
      } else {
        if (itr.dvx) victim.velocities[0].x = itr.dvx * attacker.facing;
        if (victim.position.y > 0 && victim.velocities[0].y > 2)
          victim.velocities[0].y = 2;
        victim.velocities[0].z = 0;
        if (itr.effect === ItrEffect.Sharp) {
          victim.world.spark(...victim.spark_point(a_cube, b_cube), "bleed");
        } else if (is_character(victim)) {
          victim.world.spark(...victim.spark_point(a_cube, b_cube), "hit");
        } else {
          victim.world.spark(
            ...victim.spark_point(a_cube, b_cube),
            "slient_hit",
          );
        }
        if (Defines.State.Caught === victim.frame.state) {
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
              id: victim.data.indexes.grand_injured[
                same_face(victim, attacker)
              ][0],
            };
          }
        }
      }
      break;
    }
  }
}
