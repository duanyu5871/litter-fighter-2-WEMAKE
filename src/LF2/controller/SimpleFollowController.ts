import { Defines } from "../../js_utils/lf2_type/defines";
import { Character } from "../entity/Character";
import { BaseController, DOUBLE_CLICK_INTERVAL } from "./BaseController";

export class SimpleFollowController extends BaseController {
  _count = 0;
  _nearest_enemy: Character | undefined;
  update() {
    this._count++;
    const c = this.character;
    const { x, z } = c.position;
    if (this._count % 30) {
      for (const e of c.world.entities) {
        if (e instanceof Character && e.team !== c.team) {
          if (!this._nearest_enemy) {
            this._nearest_enemy = e;
          } else {
            const { x: ex_1, z: ez_1 } = this._nearest_enemy.position;
            const { x: ex_2, z: ez_2 } = e.position;
            const distance_1 = Math.abs(ex_1 - x) + Math.abs(ez_1 - z);
            const distance_2 = Math.abs(ex_2 - x) + Math.abs(ez_2 - z);
            if (distance_1 > distance_2) {
              this._nearest_enemy = e;
            }
          }
        }
      }
    }
    const { x: end_x, z: end_z } = this._nearest_enemy?.position || c.position;

    const DEAD_ZONE = 50;
    const RUN_ZONE = 100;
    if (end_x - x > RUN_ZONE) {
      if (c.get_frame().state !== Defines.State.Running && !this.double_clicks.R) {
        const v2 = this._update_count;
        const v1 = v2 - DOUBLE_CLICK_INTERVAL + 10;
        const v0 = v1 - DOUBLE_CLICK_INTERVAL + 10;
        this.double_clicks.R = [v0, v1]
        this.press_keys('R');
        this.release_keys('L');
        console.log('try_run r!')
      }
    } else if (x - end_x > RUN_ZONE) {
      if (c.get_frame().state !== Defines.State.Running && !this.double_clicks.L) {
        const v2 = this._update_count;
        const v1 = v2 - DOUBLE_CLICK_INTERVAL + 10;
        const v0 = v1 - DOUBLE_CLICK_INTERVAL + 10;
        this.double_clicks.L = [v0, v1]
        this.press_keys('L')
        this.release_keys('R')
        console.log('try_run l!')
      }
    } else if (end_x - x > DEAD_ZONE) {
      this.press_keys('R').release_keys('L')
    } else if (x - end_x > DEAD_ZONE) {
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
    return super.update();
  }
}
