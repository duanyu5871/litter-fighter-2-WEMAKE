import { IFrameInfo, INextFrame } from "../defines";
import Entity from "../entity/Entity";
import { ICollision } from "../entity/ICollision";
import { is_character, is_weapon, is_ball } from "../entity/type_check";
import BallState_Base from "./BallState_Base";
import CharacterState_Base from "./CharacterState_Base";
import State_Base, { WhatNext } from "./State_Base";
import WeaponState_Base from "./WeaponState_Base";

export class StateBase_Proxy extends State_Base implements Required<State_Base> {
  private character_proxy = new CharacterState_Base();
  private weapon_proxy = new WeaponState_Base();
  private ball_proxy = new BallState_Base();
  private proxy = new State_Base();
  get_proxy(e: Entity) {
    if (is_character(e)) return this.character_proxy;
    if (is_weapon(e)) return this.weapon_proxy;
    if (is_ball(e)) return this.ball_proxy;
    return this.proxy;
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    return this.get_proxy(e).enter?.(e, prev_frame);
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    return this.get_proxy(e).leave?.(e, next_frame);
  }
  override update(e: Entity): void {
    return this.get_proxy(e).update(e);
  }
  override on_landing(e: Entity): void {
    return this.get_proxy(e).on_landing?.(e);
  }
  override get_auto_frame(e: Entity): IFrameInfo | undefined {
    return this.get_proxy(e).get_auto_frame?.(e);
  }
  override before_collision(collision: ICollision): WhatNext {
    return this.get_proxy(collision.attacker).before_collision?.(collision) || WhatNext.Continue;
  }
  override before_be_collided(collision: ICollision): WhatNext {
    return this.get_proxy(collision.attacker).before_be_collided?.(collision) || WhatNext.Continue;
  }
  override on_collision(collision: ICollision): void {
    this.get_proxy(collision.attacker).on_collision?.(collision);
  }
  override on_be_collided(collision: ICollision): void {
    this.get_proxy(collision.victim).on_be_collided?.(collision);
  }
  override get_sudden_death_frame(target: Entity): INextFrame | undefined {
    return this.get_proxy(target)?.get_sudden_death_frame?.(target);
  }
  override get_caught_end_frame(target: Entity): INextFrame | undefined {
    return this.get_proxy(target)?.get_caught_end_frame?.(target);
  }
  override find_frame_by_id(e: Entity, id: string | undefined): IFrameInfo | undefined {
    return this.get_proxy(e)?.find_frame_by_id?.(e, id);
  }
}
