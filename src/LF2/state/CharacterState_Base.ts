import { Defines, IFrameInfo, ItrKind, TNextFrame } from '../defines';
import { BdyKind } from '../defines/BdyKind';
import { ItrEffect } from '../defines/ItrEffect';
import type Entity from '../entity/Entity';
import { ICollision } from '../entity/ICollision';
import { is_character, is_weapon } from '../entity/type_check';
import { collision_handler } from './CollisionHandler';
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

  override before_collision(collision: ICollision): WhatNext {
    const { itr, attacker, victim } = collision
    switch (itr.kind) {
      case ItrKind.Catch: {
        if (attacker.dizzy_catch_test(victim)) {
          attacker.start_catch(victim, itr);
        }
        return WhatNext.SkipAll;
      }
      case ItrKind.ForceCatch: {
        attacker.start_catch(victim, itr);
        return WhatNext.SkipAll
      }
      case ItrKind.Pick: {
        if (is_weapon(victim)) {
          if (victim.data.base.type === Defines.WeaponType.Heavy) {
            attacker.next_frame = { id: attacker.data.indexes?.picking_heavy }
          } else {
            attacker.next_frame = { id: attacker.data.indexes?.picking_light }
          }
        }
        return WhatNext.SkipAll;
      }
      case ItrKind.PickSecretly:
        // do nothing
        return WhatNext.SkipAll;
      default: {
        return super.before_collision(collision)
      }
    }
  }

  override before_be_collided(collision: ICollision): WhatNext {
    const { itr, attacker, victim, } = collision
    if (itr.kind === ItrKind.Heal)
      return WhatNext.SkipAll; // TODO.
    if (itr.kind === ItrKind.SuperPunchMe) {
      victim.v_rests.set(attacker.id, collision);
      return WhatNext.SkipAll;
    }
    if (!is_character(victim)) {
      victim.velocities.length = 1;
      victim.velocities[0].set(0, 0, 0);
      return WhatNext.OnlyEntity;
    }
    return super.before_be_collided(collision)
  }

  override on_be_collided(collision: ICollision): void {
    const { itr, bdy, attacker, victim, a_cube, b_cube } = collision
    switch (bdy.kind) {
      case BdyKind.Defend: {
        if (
          ItrEffect.FireExplosion === itr.effect ||
          ItrEffect.Explosion === itr.effect
        ) {
          // 爆炸伤害允许不需要方向
        } else if (attacker.facing === victim.facing) {
          // 默认仅允许抵御来自前方的伤害
          break;
        }
        if (itr.bdefend && itr.bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE)
          break;
        if (itr.bdefend)
          victim.defend_value -= itr.bdefend;
        if (victim.defend_value <= 0) { // 破防
          victim.defend_value = 0;
          victim.world.spark(...victim.spark_point(a_cube, b_cube), "broken_defend")
          const result = bdy.break_act && victim.get_next_frame(bdy.break_act)
          if (result) {
            victim.next_frame = result.frame
            return;
          }
        } else {
          if (itr.dvx) victim.velocities[0].x = itr.dvx * attacker.facing / 2;
          victim.world.spark(...victim.spark_point(a_cube, b_cube), "defend_hit")
          const result = bdy.hit_act && victim.get_next_frame(bdy.hit_act)
          if (result) victim.next_frame = result.frame
          return;
        }
        break;
      }
    }
    if (itr.injury) {
      victim.defend_value = 0;
      victim.hp -= itr.injury;
      attacker.add_damage_sum(itr.injury);
      if (victim.hp <= 0) attacker.add_kill_sum(1);
    }
    switch (itr.kind) {
      case ItrKind.Normal:
        this.handle_itr_kind_normal(collision)
        break;
      case ItrKind.MagicFlute:
      case ItrKind.MagicFlute2: {
        victim.merge_velocities()
        if (victim.velocities[0].y < 3)
          victim.velocities[0].y += 3;
        if (victim.frame.state !== Defines.State.Falling)
          victim.next_frame = victim.get_next_frame(victim.data.indexes?.falling?.[-1][0]!)?.frame;
        victim.handle_velocity_decay(0.25)
        break;
      }
      default:
        collision_handler.handle(collision)
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
