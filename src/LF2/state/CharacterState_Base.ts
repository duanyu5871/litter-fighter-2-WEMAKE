import { collisions_keeper } from "../collision/CollisionKeeper";
import { BdyKind, Defines, ICollision, IFrameInfo, IItrInfo, INextFrame, ItrEffect, ItrKind } from "../defines";
import type Entity from "../entity/Entity";
import { is_character, is_weapon } from "../entity/type_check";
import State_Base, { WhatNext } from "./State_Base";

export default class CharacterState_Base extends State_Base {
  override pre_update(e: Entity): void {
    e.update_resting();
  }
  override update(e: Entity): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
  override on_landing(e: Entity): void {
    e.enter_frame({ id: e.data.indexes?.landing_2 });
  }
  override get_auto_frame(e: Entity): IFrameInfo | undefined {
    let fid: string | undefined;
    if (e.holding?.data.base.type === Defines.WeaponType.Heavy) {
      fid = e.data.indexes?.heavy_obj_walk?.[0];
    } else if (e.position.y > 0) {
      fid = e.data.indexes?.in_the_sky?.[0];
    } else if (e.hp > 0) {
      fid = e.data.indexes?.standing;
    } else {
      fid = e.data.indexes?.standing; // TODO
    }
    if (!fid) return void 0;
    return e.data.frames[fid];
  }

  override before_collision(collision: ICollision): WhatNext {
    const { itr, attacker, victim } = collision;
    switch (itr.kind) {
      case ItrKind.Catch: {
        if (attacker.dizzy_catch_test(victim)) {
          attacker.start_catch(victim, itr);
        }
        return WhatNext.SkipAll;
      }
      case ItrKind.ForceCatch: {
        attacker.start_catch(victim, itr);
        return WhatNext.SkipAll;
      }
      case ItrKind.Pick: {
        if (is_weapon(victim)) {
          if (victim.data.base.type === Defines.WeaponType.Heavy) {
            attacker.next_frame = { id: attacker.data.indexes?.picking_heavy };
          } else {
            attacker.next_frame = { id: attacker.data.indexes?.picking_light };
          }
        }
        return WhatNext.SkipAll;
      }
      case ItrKind.PickSecretly:
        // do nothing
        return WhatNext.SkipAll;
      default: {
        return super.before_collision(collision);
      }
    }
  }

  override before_be_collided(collision: ICollision): WhatNext {
    const { itr, attacker, victim } = collision;
    if (itr.kind === ItrKind.Heal) {
      if (itr.injury) victim.healing = itr.injury;
      return WhatNext.SkipAll;
    }
    if (itr.kind === ItrKind.SuperPunchMe) {
      victim.v_rests.set(attacker.id, collision);
      return WhatNext.SkipAll;
    }
    if (!is_character(victim)) {
      victim.velocities.length = 1;
      victim.velocities[0].set(0, 0, 0);
      return WhatNext.OnlyEntity;
    }
    return super.before_be_collided(collision);
  }

  override on_be_collided(collision: ICollision): void {
    const { itr, bdy, attacker, victim, a_cube, b_cube } = collision;
    switch (bdy.kind) {
      case BdyKind.Defend: {
        if (
          // 默认仅允许抵御来自前方的伤害
          (ItrEffect.FireExplosion !== itr.effect &&
            ItrEffect.Explosion !== itr.effect &&
            attacker.facing === victim.facing) ||
          (itr.bdefend &&
            itr.bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE)
        ) {
          collisions_keeper.get(
            attacker.type,
            itr.kind!,
            victim.type,
            BdyKind.Normal,
          )?.(collision);
          break;
        }
        if (itr.bdefend) victim.defend_value -= itr.bdefend;
        this.take_injury(itr, victim, attacker, 0.1);
        if (victim.defend_value <= 0) {
          // 破防
          victim.defend_value = 0;
          victim.world.spark(
            ...victim.spark_point(a_cube, b_cube),
            "broken_defend",
          );

          
          const action = bdy.actions?.find(v => v.type === 'broken_defend');
          if (action) {
            const result = victim.get_next_frame(action.data);
            if (result) victim.next_frame = result.frame;
          }
        } else {
          if (itr.dvx) victim.velocities[0].x = (itr.dvx * attacker.facing) / 2;
          victim.world.spark(
            ...victim.spark_point(a_cube, b_cube),
            "defend_hit",
          );

          const action = bdy.actions?.find(v => v.type === 'defend');
          if (action) {
            const result = victim.get_next_frame(action.data);
            if (result) victim.next_frame = result.frame;
          }
          return;
        }
        break;
      }
    }
    this.take_injury(itr, victim, attacker);
    victim.defend_value = 0;
    collisions_keeper.handle(collision);
  }

  private take_injury(
    itr: IItrInfo,
    victim: Entity,
    attacker: Entity,
    scale: number = 1,
  ) {
    if (!itr.injury) return;
    const inj = Math.round(itr.injury * scale);
    victim.hp -= inj;
    victim.hp_r -= Math.floor(inj * (1 - victim.world.hp_recoverability))
    attacker.add_damage_sum(inj);
    if (victim.hp <= 0) attacker.add_kill_sum(1);
  }

  override get_sudden_death_frame(target: Entity): INextFrame | undefined {
    target.velocities[0].y = 2;
    target.velocities[0].x = 2 * target.facing;
    if (target.data.indexes?.falling)
      return { id: target.data.indexes?.falling[1][1] };
    return void 0;
  }

  override get_caught_end_frame(target: Entity): INextFrame | undefined {
    target.velocities[0].y = 2;
    target.velocities[0].x = -2 * target.facing;
    if (target.data.indexes?.falling)
      return { id: target.data.indexes.falling[-1][1] };
    return void 0;
  }

  override find_frame_by_id(
    e: Entity,
    id: string | undefined,
  ): IFrameInfo | undefined {
    if (
      e.hp <= 0 &&
      e.position.y <= 0 &&
      e.frame.state === StateEnum.Lying
    ) {
      return e.frame;
    }
  }
}
