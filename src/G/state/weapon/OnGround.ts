import { IFrameInfo } from "../../../js_utils/lf2_type";
import { Entity } from "../../entity/Entity";
import { Weapon } from "../../entity/Weapon";
import { BaseWeaponState } from "./Base";

export class OnGround extends BaseWeaponState {
  enter(e: Weapon, prev_frame: IFrameInfo): void {
    e.team = Entity.new_team();
  }
  update(e: Weapon): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}
