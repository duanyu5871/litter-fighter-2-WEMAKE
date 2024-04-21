import { IFrameInfo } from "../../../common/lf2_type";
import { Defines } from "../../../common/lf2_type/defines";
import type { Character } from '../../entity/Character';
import BaseState from "../BaseState";
import { BaseCharacterState } from "./Base";
import Burning from "./Burning";
import Dash from "./Dash";
import Falling from "./Falling";
import Frozen from "./Frozen";
import Jump from "./Jump";
import Running from "./Running";
import Standing from "./Standing";
import Walking from "./Walking";

export const CHARACTER_STATES = new Map<number, BaseState<Character>>()
CHARACTER_STATES.set(Defines.State.Any, new BaseCharacterState())
CHARACTER_STATES.set(Defines.State.Standing, new Standing());
CHARACTER_STATES.set(Defines.State.Walking, new Walking());
CHARACTER_STATES.set(Defines.State.Running, new Running());
CHARACTER_STATES.set(Defines.State.Jump, new Jump());
CHARACTER_STATES.set(Defines.State.Dash, new Dash());
CHARACTER_STATES.set(Defines.State.Falling, new Falling());
CHARACTER_STATES.set(Defines.State.Burning, new Burning());
CHARACTER_STATES.set(Defines.State.Frozen, new Frozen());
CHARACTER_STATES.set(Defines.State.Lying, new class extends BaseCharacterState {
  override enter(e: Character, prev_frame: IFrameInfo): void {
    if (e.get_frame().state === Defines.State.Lying && e.hp <= 0) {
      e.callbacks.emit('on_dead')(e);
    }
  }
  begin(e: Character) {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}())

CHARACTER_STATES.set(Defines.State.Caught, new class extends BaseState<Character> {
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

CHARACTER_STATES.set(Defines.State.NextAsLanding, new class extends BaseCharacterState {
  on_landing(e: Character, vx: number, vy: number, vz: number): void {
    e.enter_frame(e.get_frame().next)
  }
}())