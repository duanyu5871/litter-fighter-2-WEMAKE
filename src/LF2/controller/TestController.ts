import { BaseController } from "./BaseController";

export class TestController extends BaseController {
  update() {
    const c = this.character;
    const { x, z } = c.position;
    const { x: end_x, z: end_z } = c.world.middle;
    const DEAD_ZONE = 10
    if (x < end_x - DEAD_ZONE) {
      this.start('R').end('L')
    } else if (x > DEAD_ZONE + end_x) {
      this.start('L').end('R')
    } else {
      this.end('L', 'R')
    }
    if (z < end_z - DEAD_ZONE) {
      this.start('D').end('U')
    } else if (z > end_z + DEAD_ZONE) {
      this.start('U').end('D')
    } else {
      this.end('D', 'U')
    }
    if (!this.key_time_maps.U && !this.key_time_maps.D && !this.key_time_maps.L && !this.key_time_maps.R) {
      this.key_time_maps.d = 1;
      this.start('d')
    } else {
      this.end('d')
    }
    return super.update();
  }
}
