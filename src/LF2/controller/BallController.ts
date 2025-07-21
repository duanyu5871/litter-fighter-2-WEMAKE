import { GameKey as GK } from "../defines";
import { FrameBehavior } from "../defines/FrameBehavior";
import Ditto from "../ditto";
import { BaseController } from "./BaseController";
import { ControllerUpdateResult } from "./ControllerUpdateResult";
const { L, R, U, D, j, d } = GK
export class BallController extends BaseController {
  readonly is_ball_controller = true;
  override update(): ControllerUpdateResult {
    switch (this.entity.frame.behavior!) {
      case FrameBehavior._04:
        break;
      case FrameBehavior._01:
      case FrameBehavior._02:
      case FrameBehavior._03:
      case FrameBehavior.AlwaysChasingSameEnemy:
      case FrameBehavior.Bat:
      case FrameBehavior.JulianBall:
        this.world.add_entity_chaser(this.entity);
        break;
    }
    if (this.entity.chasing_target) {
      const p1 = this.entity.position;
      const p2 = this.entity.chasing_target.position;
      const a = new Ditto.Vector2(this.entity.velocity.x, this.entity.velocity.z).normalize();
      if (this.entity.hp > 0) {
        this.entity.merge_velocities();
        if (p2.x - p1.x < 0) this.press(L).release(R)
        else if (p2.x - p1.x > 0) this.press(R).release(L)
        else this.release(L, R)

        if (p2.z - p1.z < 0) this.press(U).release(D)
        else if (p2.z - p1.z > 0) this.press(D).release(U)
        else this.release(U, D)

        if (p1.y > p2.y + this.entity.chasing_target.frame.centery / 2) {
          this.press(j).release(d)
        } else if (p1.y < p2.y + this.entity.chasing_target.frame.centery / 2) {
          this.press(d).release(j)
        } else {
          this.release(j, d)
        }
      } else {
        this.entity.velocity_0.y = 0;
        this.release(U, D, R, L, j, d)
      }
      if (a.x > 0 && this.entity.facing < 0) {
        this.entity.facing = 1
      } else if (a.x < 0 && this.entity.facing > 0) {
        this.entity.facing = -1
      }
    }
    return super.update();
  }
}