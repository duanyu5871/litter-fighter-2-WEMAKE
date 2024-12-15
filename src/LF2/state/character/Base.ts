import { Defines, IBdyInfo, IFrameInfo, IItrInfo, TFace, TNextFrame } from '../../defines';
import type Character from '../../entity/Character';
import Entity from '../../entity/Entity';
import { same_face, turn_face } from '../../entity/face_helper';
import { is_weapon } from '../../entity/type_check';
import { ICube } from '../../World';
import BaseState, { WhatNext } from "../base/BaseState";

export default class BaseCharacterState extends BaseState<Character> {
  override update(e: Character): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
  override on_landing(e: Character): void {
    e.enter_frame({ id: e.data.indexes.landing_2 });
  }
  override get_auto_frame(e: Character): IFrameInfo | undefined {
    const { in_the_sky, standing, heavy_obj_walk } = e.data.indexes;
    let fid: string;
    if (is_weapon(e.holding) && e.holding.data.base.type === Defines.WeaponType.Heavy) {
      fid = heavy_obj_walk[0]
    } else if (e.position.y > 0) {
      fid = in_the_sky[0]
    } else if (e.hp > 0) {
      fid = standing;
    } else {
      fid = standing; // TODO
    }
    return e.data.frames[fid];
  }

  override before_collision(
    attacker: Character, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): WhatNext {
    switch (itr.kind) {
      case Defines.ItrKind.Catch: {
        if (attacker.dizzy_catch_test(target)) {
          attacker.start_catch(target, itr);
        }
        return WhatNext.Interrupt;
      }
      case Defines.ItrKind.ForceCatch: {
        attacker.start_catch(target, itr);
        return WhatNext.Interrupt
      }
      case Defines.ItrKind.Pick: {
        if (is_weapon(target)) {
          if (target.data.base.type === Defines.WeaponType.Heavy) {
            attacker.next_frame = { id: attacker.data.indexes.picking_heavy }
          } else {
            attacker.next_frame = { id: attacker.data.indexes.picking_light }
          }
        }
        return WhatNext.Interrupt;
      }
      case Defines.ItrKind.PickSecretly:
        // do nothing
        return WhatNext.Interrupt;
      default: {
        return WhatNext.Continue
      }
    }
  }

  override before_be_collided(
    attacker: Character, target: Entity,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): WhatNext {
    if (itr.kind === Defines.ItrKind.Heal)
      return WhatNext.Interrupt; // TODO.
    if (itr.kind === Defines.ItrKind.SuperPunchMe) {
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

  override on_be_collided(attacker: Entity, target: Character, itr: IItrInfo, bdy: IBdyInfo, r0: ICube, r1: ICube): void {

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
      case Defines.ItrKind.Catch:
        if (attacker.dizzy_catch_test(target))
          target.start_caught(attacker, itr)
        return;
      case Defines.ItrKind.ForceCatch: {
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
        target.next_frame = { id: target.data.indexes.ice, facing: turn_face(attacker.facing) }
        break;
      }
      case Defines.ItrEffect.Explosion:
      case Defines.ItrEffect.Normal:
      case Defines.ItrEffect.Sharp:
      case void 0: {
        target.fall_value -= itr.fall ? itr.fall : Defines.DEFAULT_ITR_FALL;
        target.defend_value = 0;
        const is_fall = target.fall_value <= 0 || target.hp <= 0 || (
          target.fall_value <= 80 && (
            target.velocities[0].y > 0 ||
            target.position.y > 0
          )
        )
        if (is_fall) {
          const aface: TFace = Defines.ItrEffect.Explosion === itr.effect ?
            (target.position.x > attacker.position.x ? -1 : 1) :
            attacker.facing;
          target.fall_value = 0;
          target.velocities.length = 1;
          target.velocities[0].y = itr.dvy ?? 4;
          target.velocities[0].z = 0;
          target.velocities[0].x = (itr.dvx || 0) * aface;
          if (itr.effect === Defines.ItrEffect.Sharp) {
            target.world.spark(...target.spark_point(r0, r1), "critical_bleed");
          } else {
            target.world.spark(...target.spark_point(r0, r1), "critical_hit")
          }
          const direction: TFace = target.velocities[0].x / target.facing >= 0 ? 1 : -1;
          target.next_frame = { id: target.data.indexes.critical_hit[direction][0] }
        } else {
          if (itr.dvx) target.velocities[0].x = itr.dvx * attacker.facing;
          if (target.position.y > 0 && target.velocities[0].y > 2) target.velocities[0].y = 2;
          target.velocities[0].z = 0;
          if (itr.effect === Defines.ItrEffect.Sharp) {
            target.world.spark(...target.spark_point(r0, r1), "bleed")
          } else {
            target.world.spark(...target.spark_point(r0, r1), "hit")
          }
          /* 击晕 */
          if (target.fall_value <= Defines.DEFAULT_FALL_VALUE_DIZZY) {
            target.next_frame = { id: target.data.indexes.dizzy };
            break;
          }
          /* 击中 */
          target.next_frame = {
            id: target.data.indexes.grand_injured[same_face(target, attacker)][0]
          }
        }
        break;
      }
    }

    const f = bdy.hit_act && target.get_next_frame(bdy.hit_act)[0]
    if (f) target.next_frame = f;
  }

  override get_sudden_death_frame(target: Character): TNextFrame {
    target.velocities[0].y = 2;
    target.velocities[0].x = 2 * target.facing;
    return { id: target.data.indexes.falling[1][1] }
  }

  override get_caught_end_frame(target: Character): TNextFrame {
    target.velocities[0].y = 2;
    target.velocities[0].x = -2 * target.facing;
    return { id: target.data.indexes.falling[-1][1] }
  }

  override find_frame_by_id(e: Character, id: string | undefined): IFrameInfo | undefined {
    if (e.hp <= 0 && e.position.y <= 0 && e.frame.state === Defines.State.Lying) {
      return e.frame;
    }
  }
}
