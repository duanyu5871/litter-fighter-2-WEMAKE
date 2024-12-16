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
    const nvx = e.facing * dx;
    const { x, y } = e.velocity;
    e.velocities[0].x = x + nvx;
    e.velocities[0].y = y + e.world.gravity * Math.sqrt(2 * h / e.world.gravity);
  }
  override on_landing(e: Character): void {
    // e.data.base.rowing_distance
    e.enter_frame({ id: e.data.indexes.landing_1 });
  }
}