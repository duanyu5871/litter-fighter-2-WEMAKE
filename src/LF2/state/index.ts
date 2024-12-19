import { Defines } from "../defines/defines";
import Entity from "../entity/Entity";
import BallState_Base from "./BallState_Base";
import CharacterState_Base from "./CharacterState_Base";
import State_Base from "./State_Base";
import State_TransformTo8XXX from "./State_TransformTo8XXX";
import { State_TransformToCatching } from "./State_TransformToCatching";
import { State_WeaponBroken } from "./State_WeaponBroken";
import { States } from "./States";
import WeaponState_Base from "./WeaponState_Base";
import WeaponState_InTheSky from "./WeaponState_InTheSky";
import WeaponState_OnGround from "./WeaponState_OnGround";
import WeaponState_OnHand from "./WeaponState_OnHand";
import WeaponState_Throwing from "./WeaponState_Throwing";
export * from "./States";
export const ENTITY_STATES = new States<Entity>();
ENTITY_STATES.set_in_range(
  Defines.State.TransformTo_Min,
  Defines.State.TransformTo_Max,
  () => new State_TransformTo8XXX()
)
ENTITY_STATES.add(
  new State_WeaponBroken(),
  new State_TransformToCatching()
)
ENTITY_STATES.set(Defines.State.Weapon_Rebounding, new WeaponState_Base())
ENTITY_STATES.set(Defines.State.Weapon_InTheSky, new WeaponState_InTheSky())
ENTITY_STATES.set(Defines.State.Weapon_OnGround, new WeaponState_OnGround())
ENTITY_STATES.set(Defines.State.Weapon_OnHand, new WeaponState_OnHand())
ENTITY_STATES.set(Defines.State.Weapon_Throwing, new WeaponState_Throwing())
ENTITY_STATES.set(Defines.State.HeavyWeapon_InTheSky, new WeaponState_InTheSky())
ENTITY_STATES.set(Defines.State.HeavyWeapon_OnGround, new WeaponState_OnGround())
ENTITY_STATES.set(Defines.State.HeavyWeapon_OnHand, new WeaponState_OnHand())
ENTITY_STATES.set(Defines.State.HeavyWeapon_Throwing, new WeaponState_Throwing())
ENTITY_STATES.set(Defines.State._Entity_Base, new State_Base())
ENTITY_STATES.set(Defines.State._Ball_Base, new BallState_Base())
ENTITY_STATES.set(Defines.State._Weapon_Base, new WeaponState_Base())
ENTITY_STATES.set(Defines.State._Character_Base, new CharacterState_Base())