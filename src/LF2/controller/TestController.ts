import { BaseController, KeyName } from "./BaseController";

export class TestController extends BaseController {
  readonly is_test_controller = true;
  static is = (v: any): v is TestController => v?.is_test_controller === true

  update() {
    const c = this.character;
    const { x, z } = c.position;
    const { x: end_x, z: end_z } = c.world.middle;
    const DEAD_ZONE = 10
    if (x < end_x - DEAD_ZONE) {
      this.start(KeyName.R).end(KeyName.L)
    } else if (x > DEAD_ZONE + end_x) {
      this.start(KeyName.L).end(KeyName.R)
    } else {
      this.end(KeyName.L, KeyName.R)
    }
    if (z < end_z - DEAD_ZONE) {
      this.start(KeyName.D).end(KeyName.U)
    } else if (z > end_z + DEAD_ZONE) {
      this.start(KeyName.U).end(KeyName.D)
    } else {
      this.end(KeyName.D, KeyName.U)
    }
    if (!this.key_time_maps.U && !this.key_time_maps.D && !this.key_time_maps.L && !this.key_time_maps.R) {
      this.key_time_maps.d = 1;
      this.start(KeyName.d)
    } else {
      this.end(KeyName.d)
    }
    return super.update();
  }
}
