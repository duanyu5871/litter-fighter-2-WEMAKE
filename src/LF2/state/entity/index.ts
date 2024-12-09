import { Defines } from "../../defines/defines";
import Entity from "../../entity/Entity";
import { States } from "../base/States";
import { WeaponBroken } from "./WeaponBroken";
import { TransformToCatching } from "./TransformToCatching";
import TransformTo8XXX from "./TransformTo8XXX";

export const ENTITY_STATES = new States<Entity>();
ENTITY_STATES.set_in_range(
  Defines.State.TransformTo_Min,
  Defines.State.TransformTo_Max,
  () => new TransformTo8XXX()
)
ENTITY_STATES.add(
  new WeaponBroken(),
  new TransformToCatching()
)

