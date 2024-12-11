import type Character from "../../entity/Character";
import BaseCharacterState from "./Base";

export default class Frozen extends BaseCharacterState {
  override on_landing(e: Character, vx: number, vy: number, vz: number): void {
    const { facing, data: { indexes } } = e;
    if (vy <= -4) {
      e.enter_frame({ id: indexes.bouncing[facing][1] });
      e.velocity.y = 2;
    }
  }
}
