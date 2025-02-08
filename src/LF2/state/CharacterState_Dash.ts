import { Defines, StateEnum, type IFrameInfo } from "../defines";
import type Entity from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";
export default class CharacterState_Dash extends CharacterState_Base {
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    if (e.position.y > 0 && e.velocity.y !== 0) return;
    const {
      dash_distance: dx = 0,
      dash_distancez: dz = 0,
      dash_height: h = 0,
    } = e.data.base;
    e.velocities[0].y = e.world.gravity * Math.sqrt((2 * h) / e.world.gravity);
    const { UD: UD1 = 0, LR: LR1 = 0 } = e.ctrl || {};

    if (UD1) e.velocities[0].z = UD1 * dz;

    if (prev_frame.state === StateEnum.Running) {
      e.velocities[0].x = e.facing * dx;
    } else if (LR1) e.velocities[0].x = LR1 * dx;
    else if (e.velocities[0].x > 0) e.velocities[0].x = dx;
    else if (e.velocities[0].x < 0) e.velocities[0].x = -dx;
    else {
      debugger;
      e.velocities[0].x = e.facing * dx;
    }
  }
}
