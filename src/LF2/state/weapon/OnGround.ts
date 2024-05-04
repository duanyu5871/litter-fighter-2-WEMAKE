import type { IFrameInfo } from "../../../common/lf2_type";
import type Weapon from "../../entity/Weapon";
import BaseWeaponState from "./Base";

export default class OnGround extends BaseWeaponState {
  enter(e: Weapon, prev_frame: IFrameInfo): void {
    e.team = '';
  }
  update(e: Weapon): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}
