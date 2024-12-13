import { Defines } from "../../defines";
import type Entity from "../../entity/Entity";
import { GONE_FRAME_INFO } from "../../entity/Entity";
import { BaseState } from "../base";

export class WeaponBroken extends BaseState {
  override readonly state = Defines.State.Weapon_Brokens;
  override enter(e: Entity): void {
    e.emitter?.velocities[0] && e.velocities[0].add(e.emitter.velocities[0]);
  }
  override update(e: Entity): void {
    e.handle_gravity();
  }
  override on_landing(e: Entity): void {
    e.enter_frame(GONE_FRAME_INFO);
  }
}


