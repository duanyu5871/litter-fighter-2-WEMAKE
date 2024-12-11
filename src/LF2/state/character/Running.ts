import type Character from '../../entity/Character';
import BaseCharacterState from "./Base";

export default class Running extends BaseCharacterState {
  override update(e: Character): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
    if (e.velocity.z) {
      const dz = Math.abs(e.velocity.z / 4);
      if (e.velocity.x > 0) {
        e.velocity.x -= dz
      } else if (e.velocity.x < 0) {
        e.velocity.x += dz;
      }
    }
    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    }
  }
}
