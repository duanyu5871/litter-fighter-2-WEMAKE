import { Defines } from "../../../common/lf2_type/defines";
import { Entity } from "../../entity/Entity";
import { States } from "../base/States";
import TurnInto from "./TurnInto";

export const ENTITY_STATES = new States<Entity>();
ENTITY_STATES.set_in_range(
  Defines.State.TurnIntoMin,
  Defines.State.TurnIntoMax,
  () => new TurnInto()
)