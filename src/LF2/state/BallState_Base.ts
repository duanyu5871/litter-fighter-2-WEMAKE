import { FrameBehavior, IFrameInfo, StateEnum } from "../defines";
import { Entity } from "../entity/Entity";
import { is_ball_ctrl } from "../entity/type_check";
import State_Base from "./State_Base";

export default class BallState_Base extends State_Base {
  override on_frame_changed(e: Entity, frame: IFrameInfo, prev_frame: IFrameInfo): void {
    if (prev_frame.behavior !== frame.behavior) {
      const ctrl = is_ball_ctrl(e.ctrl) ? e.ctrl : null
      switch (prev_frame.behavior as FrameBehavior) {
        case FrameBehavior.JohnChase:
        case FrameBehavior.DennisChase:
        case FrameBehavior._03:
        case FrameBehavior.JulianBall:
          e.world.del_enemy_chaser(e);
          if (ctrl) ctrl.target_position = null;
          break;
      }
      switch (frame.behavior as FrameBehavior) {
        case FrameBehavior.JohnChase:
        case FrameBehavior.DennisChase:
        case FrameBehavior._03:
        case FrameBehavior.JulianBall:
          e.world.add_enemy_chaser(e);
          if (ctrl) ctrl.target_position = ctrl.target_position ?? ctrl.entity.position.clone()
          break;
      }
    }

  }
  override enter(e: Entity, _prev_frame: IFrameInfo): void {
    switch (e.frame.state) {
      case StateEnum.Ball_Hitting:
      case StateEnum.Ball_Hit:
      case StateEnum.Ball_Rebounding:
      case StateEnum.Ball_Disappear:
        e.shaking = 0;
        e.motionless = 0;
        e.velocities.length = 1;
        e.velocity_0.x = 0;
        e.velocity_0.z = 0;
        e.velocity_0.y = 0;
        break;
    }
  }
  override update(e: Entity): void {
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
}
