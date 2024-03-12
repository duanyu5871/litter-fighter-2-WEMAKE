import { Weapon } from "../../entity/Weapon";
import { sound_mgr } from "../../loader/SoundMgr";
import { BaseWeaponState } from "./Base";

export class InTheSky extends BaseWeaponState {
  update(e: Weapon): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
  on_landing(e: Weapon, vx: number, vy: number, vz: number): void {
    const { base, indexes } = e.data
    const dvy = Math.floor(-vy * base.bounce ?? 0);
    const min_bounce_vy = 2;
    if (dvy < min_bounce_vy) {
      e.enter_frame(indexes.just_on_ground)
    } else {
      e.velocity.y = dvy;
    }
    e.hp -= base.weapon_drop_hurt;
    const sound_name = e.hp <= 0 ?
      base.weapon_broken_sound :
      base.weapon_drop_sound;

    const { x, y, z } = e.position;
    sound_mgr.play(sound_name, x, y, z);
  }
}

