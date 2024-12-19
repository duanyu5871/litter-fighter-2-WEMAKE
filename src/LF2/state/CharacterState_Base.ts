import { Defines, IBdyInfo, IFrameInfo, IItrInfo, ItrKind, TFace, TNextFrame } from '../defines';
import type Entity from '../entity/Entity';
import { same_face, turn_face } from '../entity/face_helper';
import { is_character, is_weapon } from '../entity/type_check';
import { ICube } from '../World';
import State_Base, { WhatNext } from "./State_Base";

export default class CharacterState_Base extends State_Base {
  override update(e: Entity): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
  override on_landing(e: Entity): void {
    e.enter_frame(e.data.indexes?.landing_2);
  }
  override get_auto_frame(e: Entity): IFrameInfo | undefined {
    let fid: string | undefined;
    if (e.holding?.data.base.type === Defines.WeaponType.Heavy) {
      fid = e.data.indexes?.heavy_obj_walk?.[0]
    } else if (e.position.y > 0) {
      fid = e.data.indexes?.in_the_sky?.[0]
    } else if (e.hp > 0) {
      fid = e.data.indexes?.standing;
    } else {
      fid = e.data.indexes?.standing; // TODO
    }
    if (!fid) return void 0;
    return e.data.frames[fid];
  }

  override before_collision(
    attacker: Entity, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): WhatNext {
    switch (itr.kind) {
      case ItrKind.Catch: {
        if (attacker.dizzy_catch_test(target)) {
          attacker.start_catch(target, itr);
        }
        return WhatNext.Interrupt;
      }
      case ItrKind.ForceCatch: {
        attacker.start_catch(target, itr);
        return WhatNext.Interrupt
      }
      case ItrKind.Pick: {
        if (is_weapon(target)) {
          if (target.data.base.type === Defines.WeaponType.Heavy) {
            attacker.next_frame = { id: attacker.data.indexes?.picking_heavy }
          } else {
            attacker.next_frame = { id: attacker.data.indexes?.picking_light }
          }
        }
        return WhatNext.Interrupt;
      }
      case ItrKind.PickSecretly:
        // do nothing
        return WhatNext.Interrupt;
      default: {
        return WhatNext.Continue
      }
    }
  }

  override before_be_collided(
    attacker: Entity, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): WhatNext {
    if (itr.kind === ItrKind.Heal)
      return WhatNext.Interrupt; // TODO.
    if (itr.kind === ItrKind.SuperPunchMe) {
      target.v_rests.set(attacker.id, {
        remain: itr.vrest || 0,
        itr,
        bdy,
        attacker,
        a_cube,
        b_cube,
        a_frame: attacker.frame,
        b_frame: target.frame
      });
      return WhatNext.Interrupt;;
    }
    return WhatNext.Continue;
  }

  override on_be_collided(attacker: Entity, target: Entity, itr: IItrInfo, bdy: IBdyInfo, r0: ICube, r1: ICube): void {

    switch (bdy.kind) {
      case Defines.BdyKind.Defend: {
        if (
          Defines.ItrEffect.FireExplosion === itr.effect ||
          Defines.ItrEffect.Explosion === itr.effect
        ) {
          // 爆炸伤害允许不需要方向
        } else if (attacker.facing === target.facing) {
          // 默认仅允许抵御来自前方的伤害
          break;
        }
        if (itr.bdefend && itr.bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE)
          break;
        if (itr.bdefend)
          target.defend_value -= itr.bdefend;
        if (target.defend_value <= 0) { // 破防
          target.defend_value = 0;
          target.world.spark(...target.spark_point(r0, r1), "broken_defend")
          const f = bdy.break_act && target.get_next_frame(bdy.break_act)[0]
          if (f) {
            target.next_frame = f
            return;
          }
        } else {
          if (itr.dvx) target.velocities[0].x = itr.dvx * attacker.facing / 2;
          target.world.spark(...target.spark_point(r0, r1), "defend_hit")
          const f = bdy.hit_act && target.get_next_frame(bdy.hit_act)[0]
          if (f) target.next_frame = f;
          return;
        }
        break;
      }
    }

    switch (itr.kind) {
      case ItrKind.Catch:
        if (attacker.dizzy_catch_test(target))
          target.start_caught(attacker, itr)
        return;
      case ItrKind.ForceCatch: {
        target.start_caught(attacker, itr)
        return;
      }
    }
    target.defend_value = 0;
    if (itr.injury) {
      target.hp -= itr.injury;
      attacker.add_damage_sum(itr.injury);
      if (target.hp <= 0) attacker.add_kill_sum(1);
    }

    switch (itr.effect) {
      case Defines.ItrEffect.Fire:
      case Defines.ItrEffect.MFire1:
      case Defines.ItrEffect.MFire2:
      case Defines.ItrEffect.FireExplosion: {
        target.fall_value = 0;
        target.defend_value = 0;
        target.velocities[0].y = itr.dvy ?? 4;
        target.velocities[0].z = 0;
        const direction = Defines.ItrEffect.FireExplosion === itr.effect ?
          (target.position.x > attacker.position.x ? -1 : 1) :
          (attacker.facing)
        target.velocities[0].x = (itr.dvx || 0) * direction;
        if (target.data.indexes?.fire)
          target.next_frame = { id: target.data.indexes.fire[0], facing: turn_face(attacker.facing) }
        break;
      }
      case Defines.ItrEffect.Ice: {
        target.fall_value = 0;
        target.defend_value = 0;
        if (itr.dvx) target.velocities[0].x = itr.dvx * attacker.facing;
        if (target.position.y > 0 && target.velocities[0].y > 2) target.velocities[0].y = 2;
        target.velocities[0].z = 0;
        const direction = target.position.x > attacker.position.x ? -1 : 1
        target.velocities[0].x = (itr.dvx || 0) * direction;
        // TODO: SOUND
        target.next_frame = { id: target.data.indexes?.ice, facing: turn_face(attacker.facing) }
        break;
      }
      case Defines.ItrEffect.Explosion:
      case Defines.ItrEffect.Normal:
      case Defines.ItrEffect.Sharp:
      case void 0: {
        const f = bdy.hit_act && target.get_next_frame(bdy.hit_act)[0]
        if (f) target.next_frame = f;

        target.fall_value -= itr.fall ? itr.fall : Defines.DEFAULT_ITR_FALL;
        target.defend_value = 0;

        const is_fall = (
          target.fall_value <= 0 ||
          target.hp <= 0
        ) || (
            target.fall_value <= 80
            && (
              Defines.State.Caught === target.frame.state ||
              target.velocities[0].y > 0 ||
              target.position.y > 0
            )
          )

        if (is_fall) {
          const aface: TFace = Defines.ItrEffect.Explosion === itr.effect ?
            (target.position.x > attacker.position.x ? -1 : 1) :
            attacker.facing;
          target.fall_value = target.fall_value_max;
          target.defend_value = target.defend_value_max;
          target.resting = 0;
          target.velocities.length = 1;
          target.velocities[0].y = itr.dvy ?? 4;
          target.velocities[0].z = 0;
          target.velocities[0].x = (itr.dvx || 0) * aface;
          if (itr.effect === Defines.ItrEffect.Sharp) {
            target.world.spark(...target.spark_point(r0, r1), "critical_bleed");
          } else if (is_character(attacker)) {
            target.world.spark(...target.spark_point(r0, r1), "critical_hit")
          } else {
            target.world.spark(...target.spark_point(r0, r1), "slient_critical_hit")
          }
          const direction: TFace = target.velocities[0].x / target.facing >= 0 ? 1 : -1;
          if (target.data.indexes?.critical_hit)
            target.next_frame = { id: target.data.indexes.critical_hit[direction][0] }
        } else {
          if (itr.dvx) target.velocities[0].x = itr.dvx * attacker.facing;
          if (target.position.y > 0 && target.velocities[0].y > 2) target.velocities[0].y = 2;
          target.velocities[0].z = 0;
          if (itr.effect === Defines.ItrEffect.Sharp) {
            target.world.spark(...target.spark_point(r0, r1), "bleed")
          } else if (is_character(attacker)) {
            target.world.spark(...target.spark_point(r0, r1), "hit")
          } else {
            target.world.spark(...target.spark_point(r0, r1), "slient_hit")
          }
          if (Defines.State.Caught === target.frame.state) {
            if (target.frame.cpoint) {
              const { backhurtact, fronthurtact } = target.frame.cpoint;
              if (attacker.facing === target.facing && backhurtact) {
                target.next_frame = { id: backhurtact };
              } else if (attacker.facing !== target.facing && fronthurtact) {
                target.next_frame = { id: fronthurtact };
              }
            }
          } else {
            /* 击晕 */
            if (target.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY) {
              target.next_frame = { id: target.data.indexes?.dizzy };
            }

            /* 击中 */
            else if (target.data.indexes?.grand_injured) {
              target.next_frame = {
                id: target.data.indexes.grand_injured[same_face(target, attacker)][0]
              }
            }
          }

        }
        break;
      }
    }


  }

  override get_sudden_death_frame(target: Entity): TNextFrame | undefined {
    target.velocities[0].y = 2;
    target.velocities[0].x = 2 * target.facing;
    if (target.data.indexes?.falling)
      return { id: target.data.indexes?.falling[1][1] }
    return void 0;
  }

  override get_caught_end_frame(target: Entity): TNextFrame | undefined {
    target.velocities[0].y = 2;
    target.velocities[0].x = -2 * target.facing;
    if (target.data.indexes?.falling)
      return { id: target.data.indexes.falling[-1][1] }
    return void 0
  }

  override find_frame_by_id(e: Entity, id: string | undefined): IFrameInfo | undefined {
    if (e.hp <= 0 && e.position.y <= 0 && e.frame.state === Defines.State.Lying) {
      return e.frame;
    }
  }
}
