import { Defines, IFrameInfo, ItrKind } from "../defines";
import type Entity from "../entity/Entity";
import { ICollision } from "../entity/ICollision";
import State_Base, { WhatNext } from "./State_Base";

export default class WeaponState_Base extends State_Base {
  override on_collision(collision: ICollision): void {
    const { attacker } = collision
    if (attacker.frame.state === Defines.State.Weapon_OnHand) {
      return;
    }
    if (attacker.data.base.type !== Defines.WeaponType.Heavy && attacker.frame.state === Defines.State.Weapon_Throwing) {
      // TODO: 这里是击中的反弹，如何更合适？ -Gim
      attacker.velocities[0].x = -0.3 * attacker.velocities[0].x;
      attacker.velocities[0].y = -0.3 * attacker.velocities[0].y;
    }
    attacker.enter_frame(attacker.data.indexes?.in_the_sky)
  }

  override before_be_collided(collision: ICollision): WhatNext {
    const { itr, attacker, victim } = collision
    if (
      itr.kind === ItrKind.Pick ||
      itr.kind === ItrKind.PickSecretly
    ) {
      if (!attacker.holding) {
        victim.holder = attacker;
        attacker.holding = victim;
        victim.team = attacker.team;
      }
      return WhatNext.SkipAll;
    }
    return super.before_be_collided(collision)
  }

  override on_be_collided(collision: ICollision): void {
    const { itr, attacker, victim, a_cube, b_cube } = collision
    const spark_x = (Math.max(a_cube.left, b_cube.left) + Math.min(a_cube.right, b_cube.right)) / 2;
    const spark_y = (Math.min(a_cube.top, b_cube.top) + Math.max(a_cube.bottom, b_cube.bottom)) / 2;
    const spark_z = Math.max(a_cube.far, b_cube.far);
    if (itr.bdefend && itr.bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) victim.hp = 0;
    else if (itr.injury) victim.hp -= itr.injury;
    const spark_frame_name = (itr.fall && itr.fall >= Defines.DEFAULT_FALL_VALUE_MAX - Defines.DEFAULT_FALL_VALUE_DIZZY) ? 'slient_critical_hit' : 'slient_hit';
    victim.world.spark(spark_x, spark_y, spark_z, spark_frame_name)
    if (victim.data.base.type === Defines.WeaponType.Heavy) {
      if (itr.fall && itr.fall >= 120) {
        const vx = itr.dvx ? itr.dvx * attacker.facing : 0;
        const vy = itr.dvy ? itr.dvy : 3;
        victim.velocities[0].x = vx / 2;
        victim.velocities[0].y = vy;
        victim.team = attacker.team;
        victim.enter_frame(victim.data.indexes?.in_the_sky)
      }
    } else {
      const vx = itr.dvx ? itr.dvx * attacker.facing : 0;
      const vy = itr.dvy ? itr.dvy : 3;
      victim.velocities[0].x = vx;
      victim.velocities[0].y = vy;
      victim.team = attacker.team;
      victim.enter_frame(victim.data.indexes?.in_the_sky)
    }
  }

  override get_auto_frame(e: Entity): IFrameInfo | undefined {
    const { frames, indexes } = e.data;
    if (e.position.y > 0) return indexes?.in_the_sky ? frames[indexes.in_the_sky] : void 0;
    return indexes?.on_ground ? frames[indexes.on_ground] : void 0;
  }

  override update(e: Entity): void {
    e.handle_ground_velocity_decay()
  }
}

