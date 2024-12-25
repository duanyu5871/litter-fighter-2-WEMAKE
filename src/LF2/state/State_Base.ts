import { Defines, ItrEffect, ItrKind, TFace, type IFrameInfo, type TNextFrame } from "../defines";
import { BdyKind } from "../defines/BdyKind";
import type Entity from "../entity/Entity";
import { same_face, turn_face } from "../entity/face_helper";
import { ICollision } from "../entity/ICollision";
import { is_character } from "../entity/type_check";
import { collision_handler } from "./CollisionHandler";
export enum WhatNext {
  OnlyState = 3,
  OnlyEntity = 2,
  SkipAll = 1,
  Continue = 0,
}
export class State_Base {
  state: number | string = '';
  update(e: Entity): void { };
  enter?(e: Entity, prev_frame: IFrameInfo): void;
  leave?(e: Entity, next_frame: IFrameInfo): void;
  on_landing?(e: Entity): void;
  get_gravity(e: Entity): number { return e.world.gravity }

  before_collision(collision: ICollision): WhatNext {
    switch (collision.itr.kind) {
      case ItrKind.Block:
        return WhatNext.SkipAll;
    }
    return WhatNext.Continue
  }

  on_collision?(collision: ICollision): void;


  /**
   * 被攻击前被调用
   * 
   * - 如果需要修改实体的帧，应该使用next_frame，否则将影响后续的碰撞判断
   * 
   * @param {ICollision} collision 碰撞信息
   * 
   * @returns {WhatNext} 后续处理方式：
   *    - 返回WhatNext.Interrupt，target.on_be_collided的后续逻辑将被跳过
   *    - 返回WhatNext.Continue，target.on_be_collided的后续逻辑将继续执行
   */
  before_be_collided(collision: ICollision): WhatNext {
    switch (collision.itr.kind) {
      case ItrKind.Block:
        return WhatNext.OnlyEntity;
    }
    return WhatNext.Continue
  }

  on_be_collided?(collision: ICollision): void;

  get_auto_frame?(e: Entity): IFrameInfo | undefined;

  get_sudden_death_frame?(e: Entity): TNextFrame | undefined;

  get_caught_end_frame?(e: Entity): TNextFrame | undefined;

  find_frame_by_id?(e: Entity, id: string | undefined): IFrameInfo | undefined

  handle_itr_kind_normal(collision: ICollision) {
    const { itr, bdy, attacker, victim, a_cube, b_cube } = collision;
    switch (itr.effect) {
      case ItrEffect.Fire:
      case ItrEffect.MFire1:
      case ItrEffect.MFire2:
      case ItrEffect.FireExplosion: {
        victim.fall_value = 0;
        victim.defend_value = 0;
        victim.velocities[0].y = itr.dvy ?? 4;
        victim.velocities[0].z = 0;
        const direction = ItrEffect.FireExplosion === itr.effect ?
          (victim.position.x > attacker.position.x ? -1 : 1) :
          (attacker.facing)
        victim.velocities[0].x = (itr.dvx || 0) * direction;
        if (victim.data.indexes?.fire)
          victim.next_frame = { id: victim.data.indexes.fire[0], facing: turn_face(attacker.facing) }
        break;
      }
      case ItrEffect.Ice2:
        collision_handler.get(ItrKind.Freeze, BdyKind.Normal)?.(collision);
        break;
      case ItrEffect.Ice: {
        if (victim.frame.state === Defines.State.Frozen) {
          this.fall(collision)
        } else {
          collision_handler.get(ItrKind.Freeze, BdyKind.Normal)?.(collision);
        }
        break;
      }
      case ItrEffect.Explosion:
      case ItrEffect.Normal:
      case ItrEffect.Sharp:
      case void 0: {
        const result = bdy.hit_act && victim.get_next_frame(bdy.hit_act)
        if (result) victim.next_frame = result.frame;
        victim.fall_value -= itr.fall ? itr.fall : Defines.DEFAULT_ITR_FALL;
        victim.defend_value = 0;
        const is_fall = (
          victim.fall_value <= 0 ||
          victim.hp <= 0 ||
          victim.frame.state === Defines.State.Frozen
        ) || (
            victim.fall_value <= (victim.fall_value_max - Defines.DEFAULT_FALL_VALUE_DIZZY)
            && (
              Defines.State.Caught === victim.frame.state ||
              victim.velocities[0].y > 0 ||
              victim.position.y > 0
            )
          )
        if (is_fall) {
          this.fall(collision)
        } else {
          if (itr.dvx) victim.velocities[0].x = itr.dvx * attacker.facing;
          if (victim.position.y > 0 && victim.velocities[0].y > 2) victim.velocities[0].y = 2;
          victim.velocities[0].z = 0;
          if (itr.effect === ItrEffect.Sharp) {
            victim.world.spark(...victim.spark_point(a_cube, b_cube), "bleed")
          } else if (is_character(victim)) {
            victim.world.spark(...victim.spark_point(a_cube, b_cube), "hit")
          } else {
            victim.world.spark(...victim.spark_point(a_cube, b_cube), "slient_hit")
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
            }

            /* 击中 */
            else if (victim.data.indexes?.grand_injured) {
              victim.next_frame = {
                id: victim.data.indexes.grand_injured[same_face(victim, attacker)][0]
              }
            }
          }

        }
        break;
      }
    }
  }
  fall(collision: ICollision) {
    const { itr, attacker, victim, a_cube, b_cube } = collision;
    const aface: TFace = ItrEffect.Explosion === itr.effect ?
      (victim.position.x > attacker.position.x ? -1 : 1) :
      attacker.facing;
    victim.fall_value = victim.fall_value_max;
    victim.defend_value = victim.defend_value_max;
    victim.resting = 0;
    victim.velocities.length = 1;
    victim.velocities[0].y = itr.dvy ?? 4;
    victim.velocities[0].z = 0;
    victim.velocities[0].x = (itr.dvx || 0) * aface;
    if (itr.effect === ItrEffect.Sharp) {
      victim.world.spark(...victim.spark_point(a_cube, b_cube), "critical_bleed");
    } else if (is_character(victim)) {
      victim.world.spark(...victim.spark_point(a_cube, b_cube), "critical_hit")
    } else {
      victim.world.spark(...victim.spark_point(a_cube, b_cube), "slient_critical_hit")
    }
    const direction: TFace = victim.velocities[0].x / victim.facing >= 0 ? 1 : -1;
    if (victim.data.indexes?.critical_hit)
      victim.next_frame = { id: victim.data.indexes.critical_hit[direction][0] }
  }
}
export default State_Base;