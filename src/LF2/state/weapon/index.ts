
import { Defines } from "../../defines/defines";
import Weapon from "../../entity/Weapon";
import { States } from "../base/States";
import { ENTITY_STATES } from "../entity";
import BaseWeaponState from "./Base";
import InTheSky from "./InTheSky";
import OnGround from "./OnGround";
import OnHand from "./OnHand";
import Throwing from "./Throwing";

export const WEAPON_STATES = new States<Weapon>()
for (const [k, v] of ENTITY_STATES.map) WEAPON_STATES.set(k, v)
WEAPON_STATES.set(Defines.State.Any, new BaseWeaponState())
WEAPON_STATES.set(Defines.State.Weapon_InTheSky, new InTheSky())
WEAPON_STATES.set(Defines.State.Weapon_OnGround, new OnGround())
WEAPON_STATES.set(Defines.State.Weapon_OnHand, new OnHand())
WEAPON_STATES.set(Defines.State.Weapon_Throwing, new Throwing())

WEAPON_STATES.set(Defines.State.HeavyWeapon_InTheSky, new InTheSky())
WEAPON_STATES.set(Defines.State.HeavyWeapon_OnGround, new OnGround())
WEAPON_STATES.set(Defines.State.HeavyWeapon_OnHand, new OnHand())
WEAPON_STATES.set(Defines.State.HeavyWeapon_Throwing, new Throwing())