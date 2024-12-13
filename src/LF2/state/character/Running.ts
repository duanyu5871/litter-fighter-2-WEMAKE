import type Character from '../../entity/Character';
import BaseCharacterState from "./Base";

export default class Running extends BaseCharacterState {
  override update(e: Character): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
    if (e.velocities[0].z) {
      const dz = Math.abs(e.velocities[0].z / 4);
      if (e.velocities[0].x > 0) {
        e.velocities[0].x -= dz
      } else if (e.velocities[0].x < 0) {
        e.velocities[0].x += dz;
      }
    }
    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    }
  }
}
