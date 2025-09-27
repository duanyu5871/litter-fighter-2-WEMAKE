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

  const in_the_skys = attacker.data.indexes?.in_the_skys;
  const throwings = attacker.data.indexes?.throwings;
  if (in_the_skys?.length && throwings?.length) {
    const throwings_idx = throwings.indexOf(attacker.frame.id)
    const in_the_skys_idx = (throwings_idx + 1) % in_the_skys.length;
    attacker.next_frame = ({ id: in_the_skys[in_the_skys_idx] });
  } else if (in_the_skys?.length) {
    attacker.next_frame = { id: in_the_skys[0] };
  } else {
    attacker.next_frame = attacker.find_auto_frame();
  }
}
