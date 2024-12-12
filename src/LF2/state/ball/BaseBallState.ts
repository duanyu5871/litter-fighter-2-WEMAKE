import { Defines, IBdyInfo, IItrInfo } from "../../defines";
import Ball from "../../entity/Ball";
import Entity from "../../entity/Entity";
import { is_character, is_weapon } from "../../entity/type_check";
import { ICube } from "../../World";
import BaseState from "../base/BaseState";

export default class BaseBallState<E extends Ball = Ball> extends BaseState<E> {
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
          e.velocity.x += acc_x
          if (e.velocity.x > 0) e.facing = 1;
          if (e.velocity.x > max_speed_x) e.velocity.x = max_speed_x
        } else if (pos_2.x < pos_1.x) {
          e.velocity.x -= acc_x
          if (e.velocity.x < 0) e.facing = -1;
          if (e.velocity.x < min_speed_x) e.velocity.x = min_speed_x
        }
        if (pos_2.z > pos_1.z) {
          e.velocity.z += acc_z
          if (e.velocity.z > max_speed_z) e.velocity.z = max_speed_z
        } else if (pos_2.z < pos_1.z) {
          e.velocity.z -= acc_z
          if (e.velocity.z < min_speed_z) e.velocity.z = min_speed_z
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
    if (is_character(target) || is_weapon(target)) {
      const f = self.frame;
      switch (itr.kind) {
        case Defines.ItrKind.Heal:
          if (!itr.injury) break;
          // TODO: 
          break;
        case Defines.ItrKind.DeadWhenHit:
          self.play_hit_sound()
          if (f.on_timeout) self.enter_frame(f.on_timeout)
          else { debugger; console.log(Ball.TAG + '::on_collision', 'Defines.ItrKind.DeadWhenHit, but on_timeout not set.') }
          break;
        default:
          self.play_hit_sound()
          if (f.on_hitting) self.enter_frame(f.on_hitting);
          else { debugger; console.log(Ball.TAG + '::on_collision', 'on_hitting not set.') }
          break;
      }
      if (itr.on_hit) self.enter_frame(itr.on_hit)
      self.velocity.x = 0;
      self.velocity.z = 0;
      self.velocity.y = 0;
    }
  }
}
