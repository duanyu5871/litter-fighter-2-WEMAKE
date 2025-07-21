import type { Entity } from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Burning extends CharacterState_Base {
  override update(e: Entity): void {
    super.update(e);
    if (e.fall_value <= 0) e.facing = e.velocity_0.x > 0 ? -1 : 1;
  }
  override on_landing(e: Entity): void {
    const { y: vy } = e.velocity;
    const {
      data: { indexes },
    } = e;
    if (vy <= -4) {
      e.enter_frame({ id: indexes?.bouncing?.[-1][1] });
      e.velocity_0.y = 2;
    } else {
      e.enter_frame({ id: indexes?.lying?.[-1] });
    }
  }
}

