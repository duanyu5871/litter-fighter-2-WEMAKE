import { GameKey } from "../defines";
import { FrameBehavior } from "../defines/FrameBehavior";
import Ditto from "../ditto";
import { BaseController } from "./BaseController";
import { ControllerUpdateResult } from "./ControllerUpdateResult";

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
      /** mode 1 */
      // const p1 = this.entity.position;
      // const p2 = this.entity.chasing_target.position;
      // if (p1.x > p2.x) {
      //   this.press(GameKey.L).release(GameKey.R)
      // } else if (p1.x < p2.x) {
      //   this.press(GameKey.R).release(GameKey.L)
      // } else {
      //   this.release(GameKey.L, GameKey.R)
      // }
      // if (p1.z > p2.z) {
      //   this.press(GameKey.U).release(GameKey.D)
      // } else if (p1.z < p2.z) {
      //   this.press(GameKey.D).release(GameKey.U)
      // } else {
      //   this.release(GameKey.U, GameKey.D)
      // }
      // if (p1.y > p2.y + this.entity.chasing_target.frame.centery / 2) {
      //   this.press(GameKey.j).release(GameKey.d)
      // } else if (p1.y < p2.y + this.entity.chasing_target.frame.centery / 2) {
      //   this.press(GameKey.d).release(GameKey.j)
      // } else {
      //   this.release(GameKey.j, GameKey.d)
      // }
      const p1 = this.entity.position;
      const p2 = this.entity.chasing_target.position;
      // const b = new Ditto.Vector2(p2.x - p1.x, p2.z - p1.z).normalize();
      const a = new Ditto.Vector2(this.entity.velocity.x, this.entity.velocity.z).normalize();
      if (this.entity.hp > 0) {
        this.entity.merge_velocities();
        if (p2.x - p1.x < 0) {
          this.press('L').release('R')
        } else if (p2.x - p1.x > 0) {
          this.press('R').release('L')
        }
        if (p2.z - p1.z < 0) {
          this.press('U').release('D')
        } else if (p2.z - p1.z > 0) {
          this.press('D').release('U')
        }
        if (p1.y > p2.y + this.entity.chasing_target.frame.centery / 2) {
          this.press(GameKey.j).release(GameKey.d)
        } else if (p1.y < p2.y + this.entity.chasing_target.frame.centery / 2) {
          this.press(GameKey.d).release(GameKey.j)
        } else {
          this.release(GameKey.j, GameKey.d)
        }
      } else {
        this.entity.velocities[0].y = 0;
        this.release(GameKey.U, GameKey.D, GameKey.R, GameKey.L, GameKey.j, GameKey.d)
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