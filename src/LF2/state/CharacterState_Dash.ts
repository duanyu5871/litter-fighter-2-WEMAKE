import { StateEnum, type IFrameInfo } from "../defines";
import type Entity from "../entity/Entity";
import CharacterState_Base from "./CharacterState_Base";
const { sqrt } = Math;
export default class CharacterState_Dash extends CharacterState_Base {
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    if (e.position.y > 0 && e.velocity.y !== 0) return;

    const { gravity } = e.world;
    const velocity = e.velocities[0];
    const {
      dash_distance: dx = 0,
      dash_distancez: dz = 0,
      dash_height: h = 0,
    } = e.data.base;
    velocity.y = gravity * sqrt((2 * h) / gravity);
    const { UD: UD1 = 0, LR: LR1 = 0 } = e.ctrl || {};

    if (UD1) velocity.z = UD1 * dz;

    if (prev_frame.state === StateEnum.Running) {
      velocity.x = e.facing * dx;
    } else if (LR1) velocity.x = LR1 * dx;
    else if (velocity.x > 0) velocity.x = dx;
    else if (velocity.x < 0) velocity.x = -dx;
    else {
      debugger;
      velocity.x = e.facing * dx;
    }
  }
}
