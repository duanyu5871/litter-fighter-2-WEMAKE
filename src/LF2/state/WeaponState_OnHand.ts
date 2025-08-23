import { Entity } from "../entity";
import { max } from "../utils";
import WeaponState_Base from "./WeaponState_Base";

export default class WeaponState_OnHand extends WeaponState_Base {
  override pre_update(e: Entity): void {
    if (e.motionless && e.holder)
      e.holder.motionless = max(e.motionless, e.holder.motionless)
  }
}
