import BaseController from "./BaseController";

export default class DDDController extends BaseController {
  update() {
    const s = this.character.position.x - this.character.world.width / 2;
    if (s < -30) {
      this.holding.R = 1;
      this.releases.L = 1;
      this.releases.d = 1;
    } else if (s > 30) {
      this.holding.L = 1;
      this.releases.R = 1;
      this.releases.d = 1;
    } else {
      this.holding.d = 1;
      this.releases.R = 1;
      this.releases.L = 1;
    }

    return super.update();
  }
}
