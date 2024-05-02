import type { Character } from '../../entity/Character';
import BaseCharacterState from "./Base";

export default class Running extends BaseCharacterState {
  update(e: Character): void {
    e.on_gravity();
    e.velocity_decay();
    const { dvx = 0, dvz = 0 } = e.get_frame();
    const i = e.controller.UD;
    const speed_z = i * dvz;
    const speed_x = e.facing * (dvx - Math.abs(speed_z));
    e.velocity.x = speed_x;
    e.velocity.z = speed_z;
    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    }
  }
}
