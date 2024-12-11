import { Defines } from "../../defines";
import type Entity from "../../entity/Entity";
import { GONE_FRAME_INFO } from "../../entity/Entity";
import { BaseState } from "../base";

export class WeaponBroken extends BaseState {
  override readonly state = Defines.State.Weapon_Brokens;
  override enter(e: Entity): void {
    e.emitter?.velocity && e.velocity.add(e.emitter.velocity);
  }
  override update(e: Entity): void {
    e.handle_gravity();
  }
  override on_landing(e: Entity, vx: number, vy: number, vz: number): void {
    e.enter_frame(GONE_FRAME_INFO);
  }
}


