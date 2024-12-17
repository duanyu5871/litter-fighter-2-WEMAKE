import type Character from "../../entity/Character";
import BaseCharacterState from "./Base";

export default class Frozen extends BaseCharacterState {
  override on_landing(e: Character): void {
    const { facing, data: { indexes } } = e;
    const { y: vy } = e.velocity;
    if (vy <= -4) {
      e.enter_frame(indexes.bouncing?.[facing][1]);
      e.velocities[0].y = 2;
    }
  }
}
