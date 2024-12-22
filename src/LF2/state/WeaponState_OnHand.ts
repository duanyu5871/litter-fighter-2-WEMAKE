import { Defines } from "../defines";
import { ICollisionInfo } from "../entity/ICollisionInfo";
import WeaponState_Base from "./WeaponState_Base";

export default class WeaponState_OnHand extends WeaponState_Base {
  override on_collision(collision: ICollisionInfo): void {
    const { itr, attacker } = collision;
    if (attacker.holder) {
      attacker.holder.motionless = itr.motionless ?? Defines.DEFAULT_ITR_MOTIONLESS;
    }
  }
}
