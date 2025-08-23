import { ICollision } from "../base/ICollision";
import { IFrameInfo, INextFrame } from "../defines";
import { Entity } from "../entity/Entity";
import { is_ball, is_character, is_weapon } from "../entity/type_check";
import BallState_Base from "./BallState_Base";
import CharacterState_Base from "./CharacterState_Base";
import State_Base from "./State_Base";
import WeaponState_Base from "./WeaponState_Base";

export class StateBase_Proxy extends State_Base implements Required<State_Base> {
  protected character_proxy = new CharacterState_Base();
  protected weapon_proxy = new WeaponState_Base();
  protected ball_proxy = new BallState_Base();
  protected proxy = new State_Base();
  constructor(
    character_proxy = new CharacterState_Base(),
    weapon_proxy = new WeaponState_Base(),
    ball_proxy = new BallState_Base(),
    proxy = new State_Base(),
  ) {
    super();
    this.character_proxy = character_proxy
    this.weapon_proxy = weapon_proxy
    this.ball_proxy = ball_proxy
    this.proxy = proxy
  }
  get_proxy(e: Entity) {
    if (is_character(e)) return this.character_proxy;
    if (is_weapon(e)) return this.weapon_proxy;
    if (is_ball(e)) return this.ball_proxy;
    return this.proxy;
  }
  override on_frame_changed(e: Entity, frame: IFrameInfo, prev_frame: IFrameInfo): void {
    return this.get_proxy(e).on_frame_changed?.(e, frame, prev_frame);
  }
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    return this.get_proxy(e).enter?.(e, prev_frame);
  }
  override leave(e: Entity, next_frame: IFrameInfo): void {
    return this.get_proxy(e).leave?.(e, next_frame);
  }
  override pre_update(e: Entity): void {
    return this.get_proxy(e).pre_update?.(e);
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
  override on_be_collided(collision: ICollision): void {
    this.get_proxy(collision.victim).on_be_collided?.(collision);
  }
  override get_sudden_death_frame(target: Entity): INextFrame | undefined {
    return this.get_proxy(target)?.get_sudden_death_frame?.(target);
  }
  override get_caught_end_frame(target: Entity): INextFrame | undefined {
    return this.get_proxy(target)?.get_caught_end_frame?.(target);
  }
  override find_frame_by_id(
    e: Entity,
    id: string | undefined,
  ): IFrameInfo | undefined {
    return this.get_proxy(e)?.find_frame_by_id?.(e, id);
  }
}
