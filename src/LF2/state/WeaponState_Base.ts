import { collisions_keeper } from "../collision/CollisionKeeper";
import { Defines, IFrameInfo, ItrKind, StateEnum, WeaponType } from "../defines";
import { ICollision } from "../base/ICollision";
import type { Entity } from "../entity/Entity";
import State_Base, { WhatNext } from "./State_Base";
import { max, min, round } from "../utils";

export default class WeaponState_Base extends State_Base {
  override on_collision(collision: ICollision): void {
    const { attacker } = collision;
    if (attacker.frame.state === StateEnum.Weapon_OnHand) {
      return;
    }
    if (
      attacker.data.base.type !== WeaponType.Heavy &&
      attacker.frame.state === StateEnum.Weapon_Throwing
    ) {
      // TODO: 这里是击中的反弹，如何更合适？ -Gim
      attacker.velocity_0.x = -0.3 * attacker.velocity_0.x;
      attacker.velocity_0.y = 0.3 * attacker.velocity_0.y;
      attacker.velocity_0.z = 0.3 * attacker.velocity_0.z;
    }
    attacker.enter_frame({ id: attacker.data.indexes?.in_the_sky });
  }

  override before_be_collided(collision: ICollision): WhatNext {
    const { itr } = collision;
    switch (itr.kind) {
      case ItrKind.Pick:
      case ItrKind.PickSecretly:
        return WhatNext.SkipAll;
    }
    return super.before_be_collided(collision);
  }

  override on_be_collided(collision: ICollision): void {
    collisions_keeper.handle(collision);
  }

  override get_auto_frame(e: Entity): IFrameInfo | undefined {
    const { frames, indexes } = e.data;
    if (e.position.y > 0)
      return indexes?.in_the_sky ? frames[indexes.in_the_sky] : void 0;
    return indexes?.on_ground ? frames[indexes.on_ground] : void 0;
  }

  override update(e: Entity): void {
    e.handle_ground_velocity_decay();
  }
}
