import { Defines } from "../../js_utils/lf2_type/defines";
import { Character } from "../entity/Character";
import { BaseController } from "./BaseController";

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
    const { facing } = c;
    const { state } = c.get_frame();
    const is_running = state === Defines.State.Running
    if (end_x - x > DEAD_ZONE) {
      this.start('R').end('L')
    } else if (x - end_x > DEAD_ZONE) {
      this.start('L').end('R')
    } else {
      if (is_running && facing > 0) this.start('L').end('R')
      else if (is_running && facing < 0) this.start('R').end('L')
      else this.end('L', 'R')
    }
    if (end_x - x > RUN_ZONE) {
      if (!is_running) this.db_time_map.R = this.time;
    } else if (x - end_x > RUN_ZONE) {
      if (!is_running) this.db_time_map.L = this.time;
    }
    if (z < end_z - DEAD_ZONE) {
      this.start('D').end('U')
    } else if (z > end_z + DEAD_ZONE) {
      this.start('U').end('D')
    } else {
      this.end('D', 'U')
    }
    return super.update();
  }
}
