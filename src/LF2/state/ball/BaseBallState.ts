import Ball from "../../entity/Ball";
import BaseState from "../base/BaseState";

export default class BaseBallState<E extends Ball = Ball> extends BaseState<E> {
  update(self: E): void {
    self.velocity_decay();


    const frame = self.get_frame();

    const max_speed_x = 5;
    const min_speed_x = -5;
    const max_speed_z = 2.5;
    const min_speed_z = -2.5;
    const acc_x = .1;
    const acc_z = .05;

    switch (frame.behavior) {
      case 1:
      case 2: {
        const { nearest_enemy } = self;
        if (!nearest_enemy) break;
        const pos_1 = self.position;
        const pos_2 = nearest_enemy.position
        if (pos_2.x > pos_1.x) {
          self.velocity.x += acc_x
          if (self.velocity.x > 0) self.facing = 1;
          if (self.velocity.x > max_speed_x) self.velocity.x = max_speed_x
        } else if (pos_2.x < pos_1.x) {
          self.velocity.x -= acc_x
          if (self.velocity.x < 0) self.facing = -1;
          if (self.velocity.x < min_speed_x) self.velocity.x = min_speed_x
        }
        if (pos_2.z > pos_1.z) {
          self.velocity.z += acc_z
          if (self.velocity.z > max_speed_z) self.velocity.z = max_speed_z
        } else if (pos_2.z < pos_1.z) {
          self.velocity.z -= acc_z
          if (self.velocity.z < min_speed_z) self.velocity.z = min_speed_z
        }
        break
      }
      default:
        self.handle_frame_velocity();
        break;
    }
  }
}
