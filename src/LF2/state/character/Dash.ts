import { IFrameInfo } from "../../../js_utils/lf2_type";
import { Defines } from "../../../js_utils/lf2_type/defines";
import { World } from "../../World";
import type { Character } from '../../entity/Character';
import { BaseCharacterState } from "./Base";
export default class Dash extends BaseCharacterState {
  enter(e: Character, prev_frame: IFrameInfo): void {
    if (e.position.y > 0 && e.velocity.y !== 0) return;

    const { dash_distance: dx, dash_distancez: dz, dash_height: h } = e.data.base;
    e.velocity.y = World.DEFAULT_GRAVITY * Math.sqrt(2 * h / World.DEFAULT_GRAVITY);
    const { UD1, LR1 } = e.controller;
    e.velocity.z = UD1 * dz;
    if (prev_frame.state === Defines.State.Running) {
      e.velocity.x = e.facing * dx;
    }
    else if (LR1) e.velocity.x = LR1 * dx;
    else if (e.velocity.x > 0) e.velocity.x = dx;
    else if (e.velocity.x < 0) e.velocity.x = -dx;
    else e.velocity.x = e.facing * dx;
  }
}
