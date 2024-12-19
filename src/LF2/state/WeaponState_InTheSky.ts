import { IFrameInfo } from "../defines";
import type Entity from "../entity/Entity";
import WeaponState_Base from "./WeaponState_Base";

export default class WeaponState_InTheSky extends WeaponState_Base {
  protected _unhurt_weapons = new Set<Entity>();
  override get_gravity(e: Entity) {
    return e.world.gravity;
  };
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    this._unhurt_weapons.add(e);
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    this._unhurt_weapons.delete(e);
  }
  override on_landing(e: Entity): void {
    const { y: vy } = e.velocity;
    const { base, indexes } = e.data
    const dvy = Math.floor(-vy * (base.bounce || 0));
    const min_bounce_vy = 2;
    if (dvy < min_bounce_vy) {
      e.enter_frame(indexes?.just_on_ground)
    } else {
      e.velocities[0].y = dvy;
    }
    if (this._unhurt_weapons.has(e)) {
      this._unhurt_weapons.delete(e);
      if (base.drop_hurt) e.hp -= base.drop_hurt;
    }
  }
  override update(e: Entity): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
}
