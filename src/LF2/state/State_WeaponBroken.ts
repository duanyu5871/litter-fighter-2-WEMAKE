import { StateEnum } from "../defines";
import type { Entity } from "../entity/Entity";
import { GONE_FRAME_INFO } from "../defines/GONE_FRAME_INFO";
import State_Base from "./State_Base";

export class State_WeaponBroken extends State_Base {
  override readonly state = StateEnum.Weapon_Brokens;
  override enter(e: Entity): void {
    e.emitter?.velocity_0 && e.velocity_0.add(e.emitter.velocity_0);
  }
  override on_landing(e: Entity): void {
    e.enter_frame(GONE_FRAME_INFO);
  }
}
