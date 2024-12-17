import { Defines, IBdyInfo, IFrameInfo, IItrInfo } from "../../defines";
import Entity from "../../entity/Entity";
import Weapon from "../../entity/Weapon";
import { ICube } from "../../World";
import BaseState, { WhatNext } from "../base/BaseState";

export default class BaseWeaponState extends BaseState<Weapon> {
  override on_collision(attacker: Weapon, target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    if (attacker.frame.state === Defines.State.Weapon_OnHand) {
      return;
    }
    if (attacker.data.base.type !== Defines.WeaponType.Heavy) {
      // TODO: 这里是击中的反弹，如何更合适？ -Gim
      attacker.velocities[0].x = -0.3 * attacker.velocities[0].x;
      attacker.velocities[0].y = -0.3 * attacker.velocities[0].y;
    }
    attacker.enter_frame(attacker.find_auto_frame())
  }

  override before_be_collided(
    attacker: Entity, target: Weapon,
    itr: IItrInfo, bdy: IBdyInfo,
    a_cube: ICube, b_cube: ICube
  ): WhatNext {
    if (
      itr.kind === Defines.ItrKind.Pick ||
      itr.kind === Defines.ItrKind.PickSecretly
    ) {
      if (!attacker.holding) {
        target.holder = attacker;
        attacker.holding = target;
        target.team = attacker.team;
      }
      return WhatNext.Interrupt;
    }
    return WhatNext.Continue;
  }

  override on_be_collided(
    attacker: Entity, target: Weapon,
    itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube
  ): void {
    const spark_x = (Math.max(a_cube.left, b_cube.left) + Math.min(a_cube.right, b_cube.right)) / 2;
    const spark_y = (Math.min(a_cube.top, b_cube.top) + Math.max(a_cube.bottom, b_cube.bottom)) / 2;
    const spark_z = Math.max(a_cube.far, b_cube.far);
    if (itr.bdefend && itr.bdefend >= Defines.DEFAULT_FORCE_BREAK_DEFEND_VALUE) target.hp = 0;
    else if (itr.injury) target.hp -= itr.injury;
    const spark_frame_name = (itr.fall && itr.fall >= 120) ? 'slient_critical_hit' : 'slient_hit';
    target.world.spark(spark_x, spark_y, spark_z, spark_frame_name)
    if (target.data.base.type === Defines.WeaponType.Heavy) {
      if (itr.fall && itr.fall >= 120) {
        const vx = itr.dvx ? itr.dvx * attacker.facing : 0;
        const vy = itr.dvy ? itr.dvy : 3;
        target.velocities[0].x = vx / 2;
        target.velocities[0].y = vy;
        target.team = attacker.team;
        target.enter_frame({ id: target.data.indexes.in_the_sky })
      }
    } else {
      const vx = itr.dvx ? itr.dvx * attacker.facing : 0;
      const vy = itr.dvy ? itr.dvy : 3;
      target.velocities[0].x = vx;
      target.velocities[0].y = vy;
      target.team = attacker.team;
      target.enter_frame({ id: target.data.indexes.in_the_sky })
    }
  }

  override get_auto_frame(e: Weapon): IFrameInfo | undefined {
    const { frames, indexes } = e.data;
    if (e.position.y > 0) return indexes.in_the_sky ? frames[indexes.in_the_sky] : void 0;
    return indexes.on_ground ? frames[indexes.on_ground] : void 0;
  }
}

