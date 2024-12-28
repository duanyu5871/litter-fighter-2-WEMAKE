import { Defines } from "../defines";
import { EntityEnum } from "../defines/EntityEnum";
import { ICollision } from "../defines/ICollision";

export function handle_itr_kind_magic_flute(collision: ICollision): void {
  const { victim } = collision;
  victim.merge_velocities();
  if (victim.velocities[0].y < 3) victim.velocities[0].y += 3;
  switch (victim.data.type) {
    case EntityEnum.Character:
      if (victim.frame.state !== Defines.State.Falling) {
        victim.next_frame = { id: victim.data.indexes?.falling?.[-1][0] };
      }
      break;
    case EntityEnum.Weapon:
      switch (victim.frame.state) {
        case Defines.State.Weapon_InTheSky:
        case Defines.State.HeavyWeapon_InTheSky:
          break;
        default:
          victim.next_frame = { id: victim.data.indexes?.in_the_sky };
          break;
      }
  }
  victim.handle_velocity_decay(0.25);
}
