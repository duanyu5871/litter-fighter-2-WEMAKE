import { Defines, IBdyInfo, IItrInfo } from "../../defines";
import Ball from "../../entity/Ball";
import Entity from "../../entity/Entity";
import { is_character, is_weapon } from "../../entity/type_check";
import { ICube } from "../../World";
import State_Base from "../State_Base";

export default class BaseBallState<E extends Ball = Ball> extends State_Base<E> {
  override update(e: E): void {
    e.handle_ground_velocity_decay();
    const frame = e.get_frame();

    const max_speed_x = 5;
    const min_speed_x = -5;
    const max_speed_z = 2.5;
    const min_speed_z = -2.5;
    const acc_x = .1;
    const acc_z = .05;

    switch (frame.behavior) {
      case 1:
      case 2: {
        const { nearest_enemy } = e;
        if (!nearest_enemy) break;
        const pos_1 = e.position;
        const pos_2 = nearest_enemy.position
        if (pos_2.x > pos_1.x) {
          e.velocities[0].x += acc_x
          if (e.velocities[0].x > 0) e.facing = 1;
          if (e.velocities[0].x > max_speed_x) e.velocities[0].x = max_speed_x
        } else if (pos_2.x < pos_1.x) {
          e.velocities[0].x -= acc_x
          if (e.velocities[0].x < 0) e.facing = -1;
          if (e.velocities[0].x < min_speed_x) e.velocities[0].x = min_speed_x
        }
        if (pos_2.z > pos_1.z) {
          e.velocities[0].z += acc_z
          if (e.velocities[0].z > max_speed_z) e.velocities[0].z = max_speed_z
        } else if (pos_2.z < pos_1.z) {
          e.velocities[0].z -= acc_z
          if (e.velocities[0].z < min_speed_z) e.velocities[0].z = min_speed_z
        }
        break
      }
      default:
        e.handle_frame_velocity();
        break;
    }
  }
  // attacker
  override on_collision(self: E, target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    target.shaking = 0;
    if (is_character(target) || is_weapon(target)) {
      switch (self.frame.state) {
        case Defines.ItrKind.JohnShield:
        case Defines.State.Ball_Flying:
          self.hp = 0;
          break;
      }
      self.velocities.length = 1
      target.velocities[0].x = 0;
      target.velocities[0].z = 0;
      target.velocities[0].y = 0;
    }
  }
  override on_be_collided(attacker: Entity, target: E, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    target.shaking = 0;
    target.velocities.length = 1
    target.velocities[0].x = 0;
    target.velocities[0].z = 0;
    target.velocities[0].y = 0;
  }
}
