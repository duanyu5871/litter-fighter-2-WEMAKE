import { IFrameInfo, TNextFrame } from "../defines";
import { Defines } from "../defines/defines";
import Entity from "../entity/Entity";
import { ICollisionInfo } from "../entity/ICollisionInfo";
import { is_ball, is_character, is_weapon } from "../entity/type_check";
import BallState_Base from "./BallState_Base";
import CharacterState_Base from "./CharacterState_Base";
import CharacterState_Burning from "./CharacterState_Burning";
import { CharacterState_Caught } from "./CharacterState_Caught";
import CharacterState_Dash from "./CharacterState_Dash";
import { CharacterState_Drink } from "./CharacterState_Drink";
import CharacterState_Falling from "./CharacterState_Falling";
import CharacterState_Frozen from "./CharacterState_Frozen";
import CharacterState_Jump from "./CharacterState_Jump";
import CharacterState_Lying from "./CharacterState_Lying";
import { CharacterState_Rowing } from "./CharacterState_Rowing";
import CharacterState_Running from "./CharacterState_Running";
import CharacterState_Standing from "./CharacterState_Standing";
import CharacterState_Teleport2FarthestAlly from "./CharacterState_Teleport2FarthestAlly";
import CharacterState_Teleport2NearestEnemy from "./CharacterState_Teleport2NearestEnemy";
import { CharacterState_TransformToLouisEX } from "./CharacterState_Transform2LouisEX";
import { CharacterState_Walking } from "./CharacterState_Walking";
import State_Base, { WhatNext } from "./State_Base";
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

ENTITY_STATES.set_all_of([
  Defines.State._Ball_Base,
  Defines.State.Ball_3005,
  Defines.State.Ball_3006,
  Defines.State.Ball_Disappear,
  Defines.State.Ball_Flying,
  Defines.State.Ball_Hit,
  Defines.State.Ball_Hitting
], () => new BallState_Base())

ENTITY_STATES.set(Defines.State._Weapon_Base, new WeaponState_Base())
ENTITY_STATES.set(Defines.State._Character_Base, new CharacterState_Base())
ENTITY_STATES.set(Defines.State.Standing, new CharacterState_Standing());
ENTITY_STATES.set(Defines.State.Walking, new CharacterState_Walking());
ENTITY_STATES.set(Defines.State.Running, new CharacterState_Running());
ENTITY_STATES.set(Defines.State.Jump, new CharacterState_Jump());
ENTITY_STATES.set(Defines.State.Dash, new CharacterState_Dash());
ENTITY_STATES.set(Defines.State.Falling, new CharacterState_Falling());
ENTITY_STATES.set(Defines.State.Burning, new CharacterState_Burning());
ENTITY_STATES.set(Defines.State.Frozen, new CharacterState_Frozen());
ENTITY_STATES.set(Defines.State.Lying, new CharacterState_Lying())
ENTITY_STATES.set(Defines.State.Caught, new CharacterState_Caught())
ENTITY_STATES.set(Defines.State.Z_Moveable, new CharacterState_Base())
ENTITY_STATES.set(Defines.State.NextAsLanding, new class extends CharacterState_Base {
  override on_landing(e: Entity): void {
    e.enter_frame(e.frame.next)
  }
}())

ENTITY_STATES.set(Defines.State.TeleportToNearestEnemy, new CharacterState_Teleport2NearestEnemy())
ENTITY_STATES.set(Defines.State.TeleportToFarthestAlly, new CharacterState_Teleport2FarthestAlly())
ENTITY_STATES.set(Defines.State.TransformToLouisEx, new CharacterState_TransformToLouisEX())
ENTITY_STATES.set(Defines.State.Rowing, new CharacterState_Rowing())
ENTITY_STATES.set(Defines.State.Drink, new CharacterState_Drink())
ENTITY_STATES.set(Defines.State.Normal, new (class State_15 extends State_Base implements Required<State_Base> {
  private character_proxy = new CharacterState_Base();
  private weapon_proxy = new WeaponState_Base();
  private ball_proxy = new BallState_Base();
  private proxy = new State_Base();
  get_proxy(e: Entity) {
    if (is_character(e)) return this.character_proxy;
    if (is_weapon(e)) return this.weapon_proxy;
    if (is_ball(e)) return this.ball_proxy;
    return this.proxy
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    e.merge_velocities()
    return this.get_proxy(e).enter?.(e, prev_frame)
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    return this.get_proxy(e).leave?.(e, next_frame)
  }
  override update(e: Entity): void {
    return this.get_proxy(e).update(e)
  }
  override on_landing(e: Entity): void {
    return this.get_proxy(e).on_landing?.(e)
  }
  override get_auto_frame(e: Entity): IFrameInfo | undefined {
    return this.get_proxy(e).get_auto_frame?.(e)
  }
  override before_collision(collision: ICollisionInfo): WhatNext {
    return this.get_proxy(collision.attacker).before_collision?.(collision) || WhatNext.Continue;
  }

  override before_be_collided(collision: ICollisionInfo): WhatNext {
    return this.get_proxy(collision.attacker).before_be_collided?.(collision) || WhatNext.Continue;
  }
  override on_collision(collision: ICollisionInfo): void {
    this.get_proxy(collision.attacker).on_collision?.(collision)
  }
  override on_be_collided(collision: ICollisionInfo): void {
    this.get_proxy(collision.victim).on_be_collided?.(collision)
  }
  override get_sudden_death_frame(target: Entity): TNextFrame | undefined {
    return this.get_proxy(target)?.get_sudden_death_frame?.(target)
  }
  override get_caught_end_frame(target: Entity): TNextFrame | undefined {
    return this.get_proxy(target)?.get_caught_end_frame?.(target)
  }
  override find_frame_by_id(e: Entity, id: string | undefined): IFrameInfo | undefined {
    return this.get_proxy(e)?.find_frame_by_id?.(e, id)
  }


})())

ENTITY_STATES.set(Defines.State.Injured, new class extends CharacterState_Base {
  override on_landing(e: Entity): void { }
}())