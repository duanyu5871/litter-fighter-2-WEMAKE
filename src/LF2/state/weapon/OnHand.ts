import type { IFrameInfo } from "../../../common/lf2_type";
import type { Weapon } from "../../entity/Weapon";
import BaseWeaponState from "./Base";

export default class OnHand extends BaseWeaponState {
  enter(e: Weapon, prev_frame: IFrameInfo): void {
    e.shadow.visible = false;
  }
  update(e: Weapon): void { }
  leave(e: Weapon, next_frame: IFrameInfo): void {
    e.shadow.visible = true;
  }
}
