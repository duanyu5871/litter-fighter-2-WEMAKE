import { StateEnum } from "../defines";
import type Entity from "../entity/Entity";
import { GONE_FRAME_INFO } from "../entity/Entity";
import State_Base from "./State_Base";

export class State_WeaponBroken extends State_Base {
  override readonly state = StateEnum.Weapon_Brokens;
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
