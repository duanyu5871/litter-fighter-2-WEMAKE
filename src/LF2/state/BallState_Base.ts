import { Defines, IFrameInfo, ItrKind } from "../defines";
import { FrameBehavior } from "../defines/FrameBehavior";
import { ICollision } from "../defines/ICollision";
import Entity from "../entity/Entity";
import { is_character, is_weapon } from "../entity/type_check";
import State_Base from "./State_Base";

export default class BallState_Base extends State_Base {
  override enter(e: Entity, _prev_frame: IFrameInfo): void {
    switch (e.frame.behavior) {
      case FrameBehavior._01:
      case FrameBehavior._02:
      case FrameBehavior._03:
        e.unsubscribe_nearest_enemy();
        break;
    }
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
  override leave(e: Entity, _next_frame: IFrameInfo): void {
    switch (e.frame.behavior) {
      case FrameBehavior._01:
      case FrameBehavior._02:
      case FrameBehavior._03:
        e.unsubscribe_nearest_enemy();
        break;
    }
  }
  override update(e: Entity): void {
    e.handle_ground_velocity_decay();
    const frame = e.frame;
    const max_speed_x = 5;
    const min_speed_x = -5;
    const max_speed_z = 2.5;
    const min_speed_z = -2.5;
    const acc_x = 0.1;
    const acc_z = 0.05;

    switch (frame.behavior) {
      case FrameBehavior._01:
      case FrameBehavior._02: {
        const { nearest_enemy } = e;
        if (!nearest_enemy) break;
        const pos_1 = e.position;
        const pos_2 = nearest_enemy.position;
        if (pos_2.x > pos_1.x) {
          e.velocities[0].x += acc_x;
          if (e.velocities[0].x > 0) e.facing = 1;
          if (e.velocities[0].x > max_speed_x) e.velocities[0].x = max_speed_x;
        } else if (pos_2.x < pos_1.x) {
          e.velocities[0].x -= acc_x;
          if (e.velocities[0].x < 0) e.facing = -1;
          if (e.velocities[0].x < min_speed_x) e.velocities[0].x = min_speed_x;
        }
        if (pos_2.z > pos_1.z) {
          e.velocities[0].z += acc_z;
          if (e.velocities[0].z > max_speed_z) e.velocities[0].z = max_speed_z;
        } else if (pos_2.z < pos_1.z) {
          e.velocities[0].z -= acc_z;
          if (e.velocities[0].z < min_speed_z) e.velocities[0].z = min_speed_z;
        }
        break;
      }
      default:
        e.handle_frame_velocity();
        break;
    }
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
    const { victim } = collision;
    victim.shaking = 0;
    victim.velocities.length = 1;
    victim.velocities[0].x = 0;
    victim.velocities[0].z = 0;
    victim.velocities[0].y = 0;
  }
}
