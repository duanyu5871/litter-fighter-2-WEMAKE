import { ICollision } from "../base/ICollision";
import { StateEnum } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { handle_injury } from "./handle_injury";
import { handle_rest } from "./handle_rest";

export function handle_itr_kind_magic_flute(collision: ICollision): void {
  handle_rest(collision)
  const { victim, attacker } = collision;
  victim.merge_velocities();
  if (victim.velocity_0.y < 3) victim.velocity_0.y += 3;
  switch (victim.data.type) {
    case EntityEnum.Fighter:
      handle_injury(collision)
      if (victim.frame.state !== StateEnum.Falling) {
        victim.next_frame = { id: victim.data.indexes?.falling?.[-1][0] };
      }
      break;
    case EntityEnum.Weapon:
      switch (victim.frame.state) {
        case StateEnum.Weapon_InTheSky:
        case StateEnum.HeavyWeapon_InTheSky:
          break;
        default:
          victim.team = attacker.team;
          victim.next_frame = { id: victim.data.indexes?.in_the_skys?.[0] };
          break;
      }
  }
  victim.handle_velocity_decay(0.25);
}
