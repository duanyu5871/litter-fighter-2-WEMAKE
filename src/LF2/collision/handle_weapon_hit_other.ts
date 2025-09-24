import { ICollision } from "../base";
import { StateEnum, WeaponType } from "../defines";

export function handle_weapon_hit_other(collision: ICollision): void {
  const { attacker } = collision;
  if (attacker.frame.state === StateEnum.Weapon_OnHand) {
    return;
  }
  if (attacker.data.base.type !== WeaponType.Heavy &&
    attacker.frame.state === StateEnum.Weapon_Throwing) {
    // TODO: 这里是击中的反弹，如何更合适？ -Gim
    attacker.velocity_0.x = -0.3 * attacker.velocity_0.x;
    attacker.velocity_0.y = 0.3 * attacker.velocity_0.y;
    attacker.velocity_0.z = 0.3 * attacker.velocity_0.z;
  }
  attacker.next_frame = { id: attacker.data.indexes?.in_the_skys?.[0] };
}
