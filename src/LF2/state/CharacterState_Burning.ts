import type Entity from '../entity/Entity';
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Burning extends CharacterState_Base {
  override update(e: Entity): void {
    super.update(e);
    if (e.fall_value <= 0)
      e.facing = e.velocities[0].x > 0 ? -1 : 1;
  }
  override on_landing(e: Entity): void {
    if (e.fall_value > 0) {
      super.on_landing(e)
    } else {
      const { y: vy } = e.velocity;
      const { data: { indexes } } = e;
      if (vy <= -4) {
        e.enter_frame(indexes?.bouncing?.[-1][1]);
        e.velocities[0].y = 2;
      } else {
        e.enter_frame(indexes?.lying?.[-1]);
      }
    }
  }
}
