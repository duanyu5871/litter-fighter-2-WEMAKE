import { Defines } from "../../defines";
import type Entity from "../../entity/Entity";
import { GONE_FRAME_INFO } from "../../entity/Entity";
import { BaseState } from "../base";

export class WeaponBroken extends BaseState {
  readonly state = Defines.State.Weapon_Brokens;
  enter(e: Entity): void {
    e.emitter?.velocity && e.velocity.add(e.emitter.velocity);
  }
  update(e: Entity): void {
    e.on_gravity();
  }
  on_landing(e: Entity, vx: number, vy: number, vz: number): void {
    e.enter_frame(GONE_FRAME_INFO);
  }
}


