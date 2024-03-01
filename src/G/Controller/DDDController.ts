import { BaseController } from "./BaseController";

export class DDDController extends BaseController {
  update() {
    const end_x = this.character.position.x - this.character.world.width / 2;
    const end_z = this.character.position.z - this.character.world.depth / 2;
    
    const DEAD_ZONE = 100
    if (end_x < -DEAD_ZONE) {
      this.holding.R = 1;
      this.releases.L = 1;
    } else if (end_x > DEAD_ZONE) {
      this.holding.L = 1;
      this.releases.R = 1;
    } else {
      this.releases.L = 1;
      this.releases.R = 1;
    }
    if (end_z < -DEAD_ZONE) {
      this.holding.D = 1;
      this.releases.U = 1;
    } else if (end_z > DEAD_ZONE) {
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
