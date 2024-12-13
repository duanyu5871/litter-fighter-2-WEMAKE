import { IItrInfo, IBdyInfo, Defines } from "../../defines";
import Entity from "../../entity/Entity";
import Weapon from "../../entity/Weapon";
import { ICube } from "../../World";
import BaseWeaponState from "./Base";

export default class OnHand extends BaseWeaponState {
  override on_collision(
    attacker: Weapon,
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
