import type { Character } from '../../entity/Character';
import { BaseCharacterState } from "./Base";

export default class Walking extends BaseCharacterState {
  update(e: Character): void {
    e.on_gravity();
    e.velocity_decay();
    const { dvx = 0, dvz = 0 } = e.get_frame();
    const { UD1, LR1, LRUD } = e.controller;
    const speed_z = UD1 * dvz;
    const speed_x = LR1 * (dvx - Math.abs(speed_z / 4));
    if (speed_x) e.velocity.x = speed_x;
    if (speed_z) e.velocity.z = speed_z;
    if (!LRUD && !e.wait) {
      e.enter_frame({ id: e.data.indexes.standing });
    }
    if (e.position.y > 0) {
      e.enter_frame({ id: e.data.indexes.in_the_sky })
    }
  }
}
