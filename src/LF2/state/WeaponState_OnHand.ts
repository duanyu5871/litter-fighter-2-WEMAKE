import { ICollision } from "../defines/ICollision";
import WeaponState_Base from "./WeaponState_Base";

export default class WeaponState_OnHand extends WeaponState_Base {
  override on_collision(collision: ICollision): void {
    const { itr, attacker } = collision;
    if (attacker.holder) {
      attacker.holder.motionless =
        itr.motionless ?? attacker.world.itr_motionless;
    }
  }
}
