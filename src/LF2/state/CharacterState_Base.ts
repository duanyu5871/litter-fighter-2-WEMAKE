import { ICollision } from "../base";
import { collisions_keeper } from "../collision/CollisionKeeper";
import { BdyKind, Defines, IFrameInfo, IItrInfo, INextFrame, ItrEffect, ItrKind, StateEnum, WeaponType } from "../defines";
import type { Entity } from "../entity/Entity";
import { is_character } from "../entity/type_check";
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
    if (e.holding?.data.base.type === WeaponType.Heavy) {
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
    const { itr } = collision;
    switch (itr.kind) {
      case ItrKind.Pick:
      case ItrKind.PickSecretly:
        collisions_keeper.get(
          collision.attacker.type,
          collision.itr.kind!,
          collision.victim.type,
          collision.bdy.kind,
        )?.(collision)
        // do nothing
        return WhatNext.SkipAll;

      case ItrKind.Catch:
      case ItrKind.ForceCatch:
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
      victim.velocity_0.set(0, 0, 0);
      return WhatNext.OnlyEntity;
    }
    return super.before_be_collided(collision);
  }

  override on_be_collided(collision: ICollision): void {
    collisions_keeper.handle(collision);
  }


  override get_sudden_death_frame(target: Entity): INextFrame | undefined {
    target.velocity_0.y = 2;
    target.velocity_0.x = 2 * target.facing;
    if (target.data.indexes?.falling)
      return { id: target.data.indexes?.falling[1][1] };
    return void 0;
  }

  override get_caught_end_frame(target: Entity): INextFrame | undefined {
    target.velocity_0.y = 2;
    target.velocity_0.x = -2 * target.facing;
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
