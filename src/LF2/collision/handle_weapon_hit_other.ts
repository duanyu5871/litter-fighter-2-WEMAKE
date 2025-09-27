import { ICollision } from "../base";
import { StateEnum, WeaponType } from "../defines";
import { round } from "../utils";

export function handle_weapon_hit_other(collision: ICollision): void {
  const { attacker } = collision;
  if (attacker.frame.state === StateEnum.Weapon_OnHand) {
    return;
  }
  if (attacker.frame.state === StateEnum.Weapon_Throwing) {
    // TODO: 这里是击中的反弹，如何更合适？ -Gim
    attacker.velocity_0.x = -0.3 * attacker.velocity_0.x;
    attacker.velocity_0.y = round(0.3 * attacker.velocity_0.y);
    attacker.velocity_0.z = 0;
  }

  const nf = attacker.find_align_frame(
    attacker.frame.id,
    attacker.data.indexes?.throwings,
    attacker.data.indexes?.in_the_skys
  )
  attacker.next_frame = nf
}
