import { Defines } from "../../defines/defines";
import Entity from "../../entity/Entity";
import { States } from "../base/States";
import { State9999 } from "./State9999";
import { StateTransformToCatching } from "./StateTransformToCatching";
import TurnInto from "./TurnInto";

export const ENTITY_STATES = new States<Entity>();
ENTITY_STATES.set_in_range(
  Defines.State.TurnIntoMin,
  Defines.State.TurnIntoMax,
  () => new TurnInto()
)
ENTITY_STATES.set(Defines.State._9999, new State9999())
ENTITY_STATES.set(Defines.State.TransformToCatching_End, new StateTransformToCatching())

