import { IFrameInfo } from "../../defines";
import Character from "../../entity/Character";
import BaseCharacterState from "./Base";

export class Rowing extends BaseCharacterState {
  override enter(e: Character, prev_frame: IFrameInfo): void {
    if (e.position.y <= 0) return;
    const {
      rowing_distance: dx = 0,
      rowing_height: h = 0
    } = e.data.base;

    e.merge_velocities()
    const { x } = e.velocity;
    if (x >= 0) {
      e.velocities[0].x = dx;
    } else {
      e.velocities[0].x = -dx;
    }
    e.velocities[0].y = e.world.gravity * Math.sqrt(2 * h / e.world.gravity);
  }
  override on_landing(e: Character): void {
    e.enter_frame(e.data.indexes?.landing_1);
  }
}