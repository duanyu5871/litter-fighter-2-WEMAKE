import { Defines, IFrameInfo, ItrKind } from "../defines";
import { FrameBehavior } from "../defines/FrameBehavior";
import { ICollision } from "../defines/ICollision";
import { State } from "../defines/State";
import Entity from "../entity/Entity";
import { is_character, is_weapon } from "../entity/type_check";
import State_Base from "./State_Base";

export default class BallState_Base extends State_Base {
  override on_frame_changed(e: Entity, frame: IFrameInfo, prev_frame: IFrameInfo): void {
    if (prev_frame.behavior !== frame.behavior) {
      switch (prev_frame.behavior as FrameBehavior) {
        case FrameBehavior._01:
        case FrameBehavior._02:
        case FrameBehavior._03:
        case FrameBehavior._04:
        case FrameBehavior.AlwaysChasingSameEnemy:
        case FrameBehavior.Bat:
        case FrameBehavior.JulianBall:
          e.world.del_entity_chaser(e);
          break;
      }
      switch (prev_frame.behavior as FrameBehavior) {
        case FrameBehavior._01:
        case FrameBehavior._02:
        case FrameBehavior._03:
        case FrameBehavior._04:
        case FrameBehavior.AlwaysChasingSameEnemy:
        case FrameBehavior.Bat:
        case FrameBehavior.JulianBall:
          e.world.add_entity_chaser(e);
          break;
      }
    }
  }
  override enter(e: Entity, _prev_frame: IFrameInfo): void {
    switch (e.frame.state) {
      case Defines.State.Ball_Hitting:
      case Defines.State.Ball_Hit:
      case Defines.State.Ball_Rebounding:
      case Defines.State.Ball_Disappear:
        e.shaking = 0;
        e.motionless = 0;
        e.velocities.length = 1;
        e.velocities[0].x = 0;
        e.velocities[0].z = 0;
        e.velocities[0].y = 0;
        break;
    }
  }
  override update(e: Entity): void {
    // e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
  override on_collision(collision: ICollision): void {
    const { attacker, victim } = collision;
    if (is_character(victim) || is_weapon(victim)) {
      attacker.velocities.length = 1;
      switch (attacker.frame.state) {
        case ItrKind.JohnShield:
        case Defines.State.Ball_Flying:
          const { victim } = collision;
          victim.shaking = 0;
          victim.velocities.length = 1;
          victim.velocities[0].x = 0;
          victim.velocities[0].z = 0;
          victim.velocities[0].y = 0;
          break;
      }
    }
  }
  override on_be_collided(collision: ICollision): void {
    const { victim, attacker } = collision;
    victim.shaking = 0;
    victim.velocities.length = 1;
    victim.velocities[0].x = 0;
    victim.velocities[0].z = 0;
    victim.velocities[0].y = 0;
    switch (victim.frame.state) {
      case State.Ball_Flying:
      case State.Ball_Rebounding:
        victim.team = attacker.team;
        // victim.facing = attacker.facing;
        break;
    }
  }
}
