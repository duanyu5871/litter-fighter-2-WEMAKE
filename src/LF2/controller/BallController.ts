import { GameKey as GK, IVector3 } from "../defines";
import { BaseController } from "./BaseController";
import { ControllerUpdateResult } from "./ControllerUpdateResult";
const { L, R, U, D, j, d } = GK
export class BallController extends BaseController {
  readonly is_ball_controller = true;
  public target_position: IVector3 | null = null
  override update(): ControllerUpdateResult {
    if (this.entity.chasing) {
      this.target_position = this.entity.chasing.position.clone();
      this.target_position.y += this.entity.chasing.frame.centery / 2
    }
    const { facing, hp } = this.entity
    if (this.target_position) {
      if (hp > 0) {
        const p2 = this.target_position;
        const p1 = this.entity.position;
        const vx = this.entity.velocity.x;
        this.entity.merge_velocities();
        if (p2.x < p1.x) this.press(L).release(R)
        else if (p2.x > p1.x) this.press(R).release(L)
        else this.release(L, R)

        if (p2.z < p1.z) this.press(U).release(D)
        else if (p2.z > p1.z) this.press(D).release(U)
        else this.release(U, D)

        if (p1.y > p2.y) this.press(j).release(d)
        else if (p1.y < p2.y) this.press(d).release(j)
        else this.release(j, d)

        if (vx > 0 && facing < 0) this.entity.facing = 1
        else if (vx < 0 && facing > 0) this.entity.facing = -1

      } else {
        this.press(facing === -1 ? L : R, d)
        this.release(facing === -1 ? R : L, j, U, D)
      }

    }
    return super.update();
  }
}