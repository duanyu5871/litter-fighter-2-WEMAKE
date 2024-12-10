import type Character from '../../entity/Character';
import BaseCharacterState from "./Base";

export default class Burning extends BaseCharacterState {
  update(e: Character): void {
    super.update(e);
    if (e.fall_value <= 0)
      e.facing = e.velocity.x > 0 ? -1 : 1;
  }
  on_landing(e: Character, vx: number, vy: number, vz: number): void {
    if (e.fall_value > 0) {
      super.on_landing(e, vx, vy, vz)
    } else {
      const { data: { indexes } } = e;
      if (vy <= -4) {
        e.enter_frame({ id: indexes.bouncing[-1][1] });
        e.velocity.y = 2;
      } else {
        e.enter_frame({ id: indexes.lying[-1] });
      }
    }
  }
}
