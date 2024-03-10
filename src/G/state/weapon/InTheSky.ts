import { Weapon } from "../../entity/Weapon";
import { BaseWeaponState } from "./Base";

export class InTheSky extends BaseWeaponState {
  update(e: Weapon): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
    if (e.position.y <= 0) {
      e.enter_frame(e.data.indexes.just_on_ground)
    }
  }
  on_landing(e: Weapon, vx: number, vy: number, vz: number): void {
    e.enter_frame(e.data.indexes.just_on_ground)
  }
}

