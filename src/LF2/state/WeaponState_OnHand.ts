import { IItrInfo, IBdyInfo, Defines } from "../defines";
import Entity from "../entity/Entity";
import { ICube } from "../World";
import WeaponState_Base from "./WeaponState_Base";

export default class WeaponState_OnHand extends WeaponState_Base {
  override on_collision(
    attacker: Entity,
    target: Entity,
    itr: IItrInfo,
    bdy: IBdyInfo,
    a_cube: ICube,
    b_cube: ICube
  ): void {
    if (attacker.holder) {
      attacker.holder.motionless = itr.motionless ?? Defines.DEFAULT_ITR_MOTIONLESS;
    }
  }
}
