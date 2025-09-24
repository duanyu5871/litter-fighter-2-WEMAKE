import { StateEnum } from "../defines/StateEnum";
import { Entity } from "../entity/Entity";
import BallState_Base from "./BallState_Base";
import CharacterState_Base from "./CharacterState_Base";
import { CharacterState_Caught } from "./CharacterState_Caught";
import CharacterState_Dash from "./CharacterState_Dash";
import { CharacterState_Drink } from "./CharacterState_Drink";
import CharacterState_Falling from "./CharacterState_Falling";
import CharacterState_Frozen from "./CharacterState_Frozen";
import { CharacterState_Injured } from "./CharacterState_Injured";
import CharacterState_Jump from "./CharacterState_Jump";
import CharacterState_Lying from "./CharacterState_Lying";
import { CharacterState_Rowing } from "./CharacterState_Rowing";
import CharacterState_Running from "./CharacterState_Running";
import CharacterState_Standing from "./CharacterState_Standing";
import CharacterState_Teleport2FarthestAlly from "./CharacterState_Teleport2FarthestAlly";
import CharacterState_Teleport2NearestEnemy from "./CharacterState_Teleport2NearestEnemy";
import { CharacterState_TransformToLouisEX } from "./CharacterState_Transform2LouisEX";
import { CharacterState_Walking } from "./CharacterState_Walking";
import { State_15 } from "./State_15";
import State_Base from "./State_Base";
import { State_Burning } from "./State_Burning";
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
export const ENTITY_STATES = new States();

ENTITY_STATES.set_in_range(
  StateEnum.TransformTo_Min,
  StateEnum.TransformTo_Max,
  (k) => new State_TransformTo8XXX(k),
);
ENTITY_STATES.set_all_of(
  [
    StateEnum._Ball_Base,
    StateEnum.Ball_3005,
    StateEnum.Ball_3006,
    StateEnum.Ball_Disappear,
    StateEnum.Ball_Flying,
    StateEnum.Ball_Hit,
    StateEnum.Ball_Hitting,
  ],
  k => new BallState_Base(k),
);
ENTITY_STATES.add(
  new State_WeaponBroken(),
  new State_TransformToCatching(),
  new WeaponState_Base(StateEnum.Weapon_Rebounding),
  new WeaponState_InTheSky(StateEnum.Weapon_InTheSky),
  new WeaponState_OnGround(StateEnum.Weapon_OnGround),
  new WeaponState_OnHand(StateEnum.Weapon_OnHand),
  new WeaponState_Throwing(StateEnum.Weapon_Throwing),
  new WeaponState_InTheSky(StateEnum.HeavyWeapon_InTheSky),
  new WeaponState_OnGround(StateEnum.HeavyWeapon_OnGround),
  new WeaponState_OnHand(StateEnum.HeavyWeapon_OnHand),
  new WeaponState_Throwing(StateEnum.HeavyWeapon_JustOnGround),
  new State_Base(StateEnum._Entity_Base),
  new WeaponState_Base(StateEnum._Weapon_Base),
  new CharacterState_Base(StateEnum._Character_Base),
  new CharacterState_Standing(),
  new CharacterState_Walking(),
  new CharacterState_Running(),
  new CharacterState_Jump(),
  new CharacterState_Dash(),
  new CharacterState_Falling(),
  new State_Burning(),
  new CharacterState_Frozen(),
  new CharacterState_Lying(),
  new CharacterState_Caught(),
  new CharacterState_Injured(),
  new CharacterState_Base(StateEnum.Z_Moveable),
  new CharacterState_Teleport2NearestEnemy(),
  new CharacterState_Teleport2FarthestAlly(),
  new CharacterState_TransformToLouisEX(),
  new CharacterState_Rowing(),
  new CharacterState_Drink(),
  new State_15(),
  new (class extends CharacterState_Base {
    override on_landing(e: Entity): void {
      e.enter_frame(e.frame.next);
    }
  })(StateEnum.NextAsLanding),
  new (class extends CharacterState_Base {
    override on_landing(e: Entity): void { }
  })(StateEnum.Injured),
);
