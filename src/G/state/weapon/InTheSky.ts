import { Weapon } from "../../entity/Weapon";
import { BaseWeaponState } from "./Base";

export class InTheSky extends BaseWeaponState {
  update(e: Weapon): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
  on_landing(e: Weapon, vx: number, vy: number, vz: number): void {
    vy = Math.floor(-vy * e.data.base.bounce ?? 0);
    if (vy <= 0) {
      e.enter_frame(e.data.indexes.just_on_ground)
    } else {
      e.velocity.y = vy;
    }
    e.hp -= e.data.base.weapon_drop_hurt;
  }
}

