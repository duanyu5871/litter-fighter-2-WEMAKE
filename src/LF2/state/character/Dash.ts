import type { IFrameInfo } from "../../defines";
import { Defines } from "../../defines/defines";
import type Character from '../../entity/Character';
import BaseCharacterState from "./Base";
export default class Dash extends BaseCharacterState {
  override enter(e: Character, prev_frame: IFrameInfo): void {
    if (e.position.y > 0 && e.velocity.y !== 0) return;
    const {
      dash_distance: dx,
      dash_distancez: dz,
      dash_height: h
    } = e.data.base;
    e.velocity.y = e.world.gravity * Math.sqrt(2 * h / e.world.gravity);
    const {
      UD: UD1 = 0,
      LR: LR1 = 0
    } = e.controller || {};
  
    if(UD1) e.velocity.z = UD1 * dz;
    
    if (prev_frame.state === Defines.State.Running) {
      e.velocity.x = e.facing * dx;
    }
    else if (LR1) e.velocity.x = LR1 * dx;
    else if (e.velocity.x > 0) e.velocity.x = dx;
    else if (e.velocity.x < 0) e.velocity.x = -dx;
    else {
      debugger;
      e.velocity.x = e.facing * dx
    };
  }
}
