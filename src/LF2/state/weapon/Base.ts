import { Weapon } from "../../entity/Weapon";
import BaseState from "../base/BaseState";

export class BaseWeaponState extends BaseState<Weapon> {
  update(e: Weapon): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}

