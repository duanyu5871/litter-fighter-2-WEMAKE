import type Character from "../entity/Character";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Frozen extends CharacterState_Base {
  override on_landing(e: Character): void {
    const { facing, data: { indexes } } = e;
    const { y: vy } = e.velocity;
    if (vy <= -4) {
      e.enter_frame(indexes?.bouncing?.[facing][1]);
      e.velocities[0].y = 2;
    }
  }
}
