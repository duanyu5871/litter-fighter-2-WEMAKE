import { Weapon } from "../../entity/Weapon";
import { BaseWeaponState } from "./Base";

export class OnGround extends BaseWeaponState {
  update(e: Weapon): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}
