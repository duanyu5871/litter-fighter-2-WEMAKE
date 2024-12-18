import { Defines } from "../../defines/defines";
import Character from '../../entity/Character';
import BaseState from "../base/BaseState";
import { States } from "../base/States";
import { ENTITY_STATES } from "../entity";
import BaseCharacterState from "./Base";
import Burning from "./Burning";
import Dash from "./Dash";
import Falling from "./Falling";
import Frozen from "./Frozen";
import Jump from "./Jump";
import Lying from "./Lying";
import { Rowing } from "./Rowing";
import Running from "./Running";
import Standing from "./Standing";
import Teleport_ToFarthestAlly from "./Teleport_ToFarthestAlly";
import Teleport_ToNearestEnemy from "./Teleport_ToNearestEnemy";
import { TransformToLouisEX } from "./TransformToLouisEX";
import Walking from "./Walking";

export const CHARACTER_STATES = (window as any).CHARACTER_STATES = new States<Character>()
for (const [k, v] of ENTITY_STATES.map) CHARACTER_STATES.set(k, v)

CHARACTER_STATES.set(Defines.State.Any, new BaseCharacterState())
CHARACTER_STATES.set(Defines.State.Standing, new Standing());
CHARACTER_STATES.set(Defines.State.Walking, new Walking());
CHARACTER_STATES.set(Defines.State.Running, new Running());
CHARACTER_STATES.set(Defines.State.Jump, new Jump());
CHARACTER_STATES.set(Defines.State.Dash, new Dash());
CHARACTER_STATES.set(Defines.State.Falling, new Falling());
CHARACTER_STATES.set(Defines.State.Burning, new Burning());
CHARACTER_STATES.set(Defines.State.Frozen, new Frozen());
CHARACTER_STATES.set(Defines.State.Lying, new Lying())

CHARACTER_STATES.set(Defines.State.Caught, new class extends BaseState<Character> {
  override enter(_e: Character): void {
    _e.velocities[0].set(0, 0, 0);
  }
}())

CHARACTER_STATES.set(Defines.State.Z_Moveable, new class extends BaseCharacterState {
  override update(e: Character): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
}())

CHARACTER_STATES.set(Defines.State.NextAsLanding, new class extends BaseCharacterState {
  override on_landing(e: Character): void {
    e.enter_frame(e.get_frame().next)
  }
}())

CHARACTER_STATES.set(Defines.State.Teleport_ToNearestEnemy, new Teleport_ToNearestEnemy())

CHARACTER_STATES.set(Defines.State.Teleport_ToFarthestAlly, new Teleport_ToFarthestAlly())
CHARACTER_STATES.set(Defines.State.TransformToLouisEx, new TransformToLouisEX())
CHARACTER_STATES.set(Defines.State.Rowing, new Rowing())

CHARACTER_STATES.set(Defines.State.Drink, new class extends BaseCharacterState {
  override update(e: Character): void {
    super.update(e);
    if (e.holding) {
      e.holding.mp -= 1;
      if (!e.holding.mp) {
        e.holding.hp = 0;
      }
    }
  }
}())