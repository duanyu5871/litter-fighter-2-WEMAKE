import { Defines } from "../../defines/defines";
import Character from '../../entity/Character';
import State_Base from "../State_Base";
import { States } from "../States";
import { ENTITY_STATES } from "..";
import CharacterState_Base from "../CharacterState_Base";
import CharacterState_Burning from "../CharacterState_Burning";
import CharacterState_Dash from "../CharacterState_Dash";
import CharacterState_Falling from "../CharacterState_Falling";
import CharacterState_Frozen from "../CharacterState_Frozen";
import CharacterState_Jump from "../CharacterState_Jump";
import CharacterState_Lying from "../CharacterState_Lying";
import { CharacterState_Rowing } from "../CharacterState_Rowing";
import CharacterState_Running from "../CharacterState_Running";
import CharacterState_Standing from "../CharacterState_Standing";
import CharacterState_Teleport2FarthestAlly from "../CharacterState_Teleport2FarthestAlly";
import CharacterState_Teleport2NearestEnemy from "../CharacterState_Teleport2NearestEnemy";
import { CharacterState_TransformToLouisEX } from "../CharacterState_Transform2LouisEX";
import { CharacterState_Walking } from "../CharacterState_Walking";
import { CharacterState_Drink } from "../CharacterState_Drink";

export const CHARACTER_STATES = (window as any).CHARACTER_STATES = new States<Character>()
for (const [k, v] of ENTITY_STATES.map) CHARACTER_STATES.set(k, v)

CHARACTER_STATES.set(Defines.State.Any, new CharacterState_Base())
CHARACTER_STATES.set(Defines.State.Standing, new CharacterState_Standing());
CHARACTER_STATES.set(Defines.State.Walking, new CharacterState_Walking());
CHARACTER_STATES.set(Defines.State.Running, new CharacterState_Running());
CHARACTER_STATES.set(Defines.State.Jump, new CharacterState_Jump());
CHARACTER_STATES.set(Defines.State.Dash, new CharacterState_Dash());
CHARACTER_STATES.set(Defines.State.Falling, new CharacterState_Falling());
CHARACTER_STATES.set(Defines.State.Burning, new CharacterState_Burning());
CHARACTER_STATES.set(Defines.State.Frozen, new CharacterState_Frozen());
CHARACTER_STATES.set(Defines.State.Lying, new CharacterState_Lying())

CHARACTER_STATES.set(Defines.State.Caught, new class extends State_Base {
  override enter(_e: Character): void {
    _e.velocities.length = 1
    _e.velocities[0].set(0, 0, 0);
  }
}())

CHARACTER_STATES.set(Defines.State.Z_Moveable, new CharacterState_Base())

CHARACTER_STATES.set(Defines.State.NextAsLanding, new class extends CharacterState_Base {
  override on_landing(e: Character): void {
    e.enter_frame(e.get_frame().next)
  }
}())

CHARACTER_STATES.set(Defines.State.TeleportToNearestEnemy, new CharacterState_Teleport2NearestEnemy())

CHARACTER_STATES.set(Defines.State.TeleportToFarthestAlly, new CharacterState_Teleport2FarthestAlly())
CHARACTER_STATES.set(Defines.State.TransformToLouisEx, new CharacterState_TransformToLouisEX())
CHARACTER_STATES.set(Defines.State.Rowing, new CharacterState_Rowing())

CHARACTER_STATES.set(Defines.State.Drink, new CharacterState_Drink())