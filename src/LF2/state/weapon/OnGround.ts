import { new_team } from "../../base";
import type { IFrameInfo } from "../../defines";
import type Weapon from "../../entity/Weapon";
import BaseWeaponState from "./Base";

export default class OnGround extends BaseWeaponState {
  override enter(e: Weapon, prev_frame: IFrameInfo): void {
    e.team = new_team();
  }
  override update(e: Weapon): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
}
