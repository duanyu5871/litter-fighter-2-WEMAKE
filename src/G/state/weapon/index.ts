
import { Defines } from "../../../js_utils/lf2_type/defines";
import BaseState from "../BaseState";
import { BaseWeaponState } from "./Base";
import { InTheSky } from "./InTheSky";
import { Throwing } from "./Throwing";
import { OnHand } from "./OnHand";
import { OnGround } from "./OnGround";

export const WEAPON_STATES = new Map<number, BaseState>();
WEAPON_STATES.set(Defines.State.Any, new BaseWeaponState())
WEAPON_STATES.set(Defines.State.Weapon_InTheSky, new InTheSky())
WEAPON_STATES.set(Defines.State.Weapon_OnGround, new OnGround())
WEAPON_STATES.set(Defines.State.Weapon_OnHand, new OnHand())
WEAPON_STATES.set(Defines.State.Weapon_Throwing, new Throwing())