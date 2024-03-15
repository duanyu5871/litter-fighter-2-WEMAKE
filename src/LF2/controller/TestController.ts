import { BaseController } from "./BaseController";

export class TestController extends BaseController {
  update() {
    const c = this.character;
    const { x, z } = c.position;
    const { x: end_x, z: end_z } = c.world.middle;
    const DEAD_ZONE = 10
    if (x < end_x - DEAD_ZONE) {
      this.press_keys('R').release_keys('L')
    } else if (x > DEAD_ZONE + end_x) {
      this.press_keys('L').release_keys('R')
    } else {
      this.release_keys('L', 'R')
    }
    if (z < end_z - DEAD_ZONE) {
      this.press_keys('D').release_keys('U')
    } else if (z > end_z + DEAD_ZONE) {
      this.press_keys('U').release_keys('D')
    } else {
      this.release_keys('D', 'U')
    }
    if (!this.holding.U && !this.holding.D && !this.holding.L && !this.holding.R) {
      this.holding.d = 1;
      this.press_keys('d')
    } else {
      this.release_keys('d')
    }
    return super.update();
  }
}
