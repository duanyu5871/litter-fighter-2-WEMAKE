import { Defines } from "../../../js_utils/lf2_type/defines";
import type { Character } from '../../entity/Character';
import BaseState from "../BaseState";
import { BaseCharacterState } from "./Base";
import Dash from "./Dash";
import Falling from "./Falling";
import Jump from "./Jump";
import Running from "./Running";
import Walking from "./Walking";

export const CHARACTER_STATES = new Map<number, BaseState<Character>>()
CHARACTER_STATES.set(Defines.State.Any, new BaseCharacterState())
CHARACTER_STATES.set(Defines.State.Walking, new Walking());
CHARACTER_STATES.set(Defines.State.Running, new Running());
CHARACTER_STATES.set(Defines.State.Jump, new Jump());
CHARACTER_STATES.set(Defines.State.Dash, new Dash());
CHARACTER_STATES.set(Defines.State.Falling, new Falling());
CHARACTER_STATES.set(Defines.State.Burning, new class extends BaseCharacterState {
  update(e: Character): void {
    super.update(e);
    e.facing = e.velocity.x >= 0 ? -1 : 1;
  }
  on_landing(e: Character, vx: number, vy: number, vz: number): void {
    const { data: { base: { indexes } } } = e;
    if (vy <= -4) {
      e.enter_frame({ id: indexes.bouncing[-1][1] });
      e.velocity.y = 2;
    } else {
      e.enter_frame({ id: indexes.lying[-1] });
    }
  }
}());
CHARACTER_STATES.set(Defines.State.Lying, new class extends BaseCharacterState {
  begin(e: Character) {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}())

CHARACTER_STATES.set(Defines.State.Caught, new class extends BaseState<Character>{
  enter(_e: Character): void {
    _e.velocity.set(0, 0, 0);
  }
}())

CHARACTER_STATES.set(Defines.State.Z_Moveable, new class extends BaseCharacterState {
  update(e: Character): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}())