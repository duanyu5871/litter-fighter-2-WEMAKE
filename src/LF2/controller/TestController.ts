import GameKey from "../defines/GameKey";
import { BaseController } from "./BaseController";

export class TestController extends BaseController {
  readonly is_test_controller = true;
  static is = (v: any): v is TestController => v?.is_test_controller === true

  update() {
    const c = this.character;
    const { x, z } = c.position;
    const { x: end_x, z: end_z } = c.world.middle;
    const DEAD_ZONE = 10
    if (x < end_x - DEAD_ZONE) {
      this.start(GameKey.R).end(GameKey.L)
    } else if (x > DEAD_ZONE + end_x) {
      this.start(GameKey.L).end(GameKey.R)
    } else {
      this.end(GameKey.L, GameKey.R)
    }
    if (z < end_z - DEAD_ZONE) {
      this.start(GameKey.D).end(GameKey.U)
    } else if (z > end_z + DEAD_ZONE) {
      this.start(GameKey.U).end(GameKey.D)
    } else {
      this.end(GameKey.D, GameKey.U)
    }
    if (!this.key_time_maps.U && !this.key_time_maps.D && !this.key_time_maps.L && !this.key_time_maps.R) {
      this.key_time_maps.d = 1;
      this.start(GameKey.d)
    } else {
      this.end(GameKey.d)
    }
    return super.update();
  }
}
