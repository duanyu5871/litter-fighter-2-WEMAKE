import { Defines, IFrameInfo, IItrInfo, ItrKind, TFace, TNextFrame } from '../defines';
import { BdyKind } from '../defines/BdyKind';
import { ItrEffect } from '../defines/ItrEffect';
import type Entity from '../entity/Entity';
import { same_face, turn_face } from '../entity/face_helper';
import { ICollisionInfo } from '../entity/ICollisionInfo';
import { is_character, is_weapon } from '../entity/type_check';
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

  override before_collision(collision: ICollisionInfo): WhatNext {
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

  override before_be_collided(collision: ICollisionInfo): WhatNext {
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

  override on_be_collided(collision: ICollisionInfo): void {
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

    switch (itr.kind) {
      case ItrKind.Catch:
        if (attacker.dizzy_catch_test(victim))
          victim.start_caught(attacker, itr)
        return;
      case ItrKind.ForceCatch: {
        victim.start_caught(attacker, itr)
        return;
      }
      case ItrKind.Wind: {
        victim.merge_velocities();
        let { x, y, z } = victim.velocities[0];
        const dz = Math.round(victim.position.z - attacker.position.z);
        const dx = Math.round(victim.position.x - attacker.position.x);
        let d = dx > 0 ? -1 : 1
        let c = dz > 0 ? -1 : dz < 0 ? 1 : 0
        y += y < 4 ? 1 : -1;
        x += d * 0.5;
        z += c * 0.5;
        victim.velocities[0].set(x, y, z)
        return;
      }
    }
    victim.defend_value = 0;
    if (itr.injury) {
      victim.hp -= itr.injury;
      attacker.add_damage_sum(itr.injury);
      if (victim.hp <= 0) attacker.add_kill_sum(1);
    }

    switch (itr.kind) {
      case ItrKind.Freeze: {
        this.frozen(victim, itr, attacker);
        return;
      }
    }

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
        this.frozen(victim, itr, attacker);
        break;
      case ItrEffect.Ice: {
        if (victim.frame.state === Defines.State.Frozen) {
          this.fall(collision)
          break;
        } else {
          this.frozen(victim, itr, attacker);
          break;
        }
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
            victim.fall_value <= 80
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

  private frozen(victim: Entity, itr: IItrInfo, attacker: Entity) {
    victim.play_sound(["data/065.wav.mp3"]);
    victim.fall_value -= itr.fall ? itr.fall : Defines.DEFAULT_ITR_FALL;
    const is_fall = victim.fall_value <= 0 || (victim.fall_value <= 80
      && (
        Defines.State.Caught === victim.frame.state ||
        victim.velocities[0].y > 0 ||
        victim.position.y > 0
      ))
    if (is_fall && itr.dvy)
      victim.velocities[0].y = itr.dvy ?? 2;
    if (itr.dvz)
      victim.velocities[0].z = itr.dvz;
    victim.velocities[0].x = (itr.dvx || 2) * attacker.facing;
    victim.next_frame = { id: victim.data.indexes?.ice };
  }

  fall(collision: ICollisionInfo) {
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
