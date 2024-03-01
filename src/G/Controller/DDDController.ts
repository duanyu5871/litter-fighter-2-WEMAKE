import { BaseController } from "./BaseController";

export class DDDController extends BaseController {
  update() {
    const c = this.character;
    const { x, z } = c.position;
    const { x: end_x, z: end_z } = c.world.middle;
    const DEAD_ZONE = 10
    if (x < end_x - DEAD_ZONE) {
      this.holding.R = 1;
      this.releases.L = 1;
    } else if (x > DEAD_ZONE + end_x) {
      this.holding.L = 1;
      this.releases.R = 1;
    } else {
      this.releases.L = 1;
      this.releases.R = 1;
    }
    if (z < end_z - DEAD_ZONE) {
      this.holding.D = 1;
      this.releases.U = 1;
    } else if (z > end_z + DEAD_ZONE) {
      this.holding.U = 1;
      this.releases.D = 1;
    } else {
      this.releases.D = 1;
      this.releases.U = 1;
    }
    if (!this.holding.U && !this.holding.D && !this.holding.L && !this.holding.R) {
      this.holding.d = 1;
    } else {
      this.releases.d = 1;
    }
    return super.update();
  }
}
