import GameKey from "../defines/GameKey";
import { Defines } from "../defines/defines";
import Character from "../entity/Character";
import Entity from "../entity/Entity";
import { is_character } from "../entity/type_check";
import { BaseController } from "./BaseController";

export class BotController extends BaseController {
  readonly is_bot_enemy_chaser = true;
  _count = 0;
  _nearest_enemy: Character | undefined;
  manhattan_to(a: Entity) {
    const { x, z } = this.character.position;
    const { x: x1, z: z1 } = a.position;
    return Math.abs(x1 - x) + Math.abs(z1 - z);
  }
  update_nearest() {
    const c = this.character;
    for (const e of c.world.entities) {
      if (!is_character(e)) continue;
      if (!e.team || !c.team || e.team !== c.team) {
        if (!this._nearest_enemy) {
          this._nearest_enemy = e;
        } else if (this.manhattan_to(e) > this.manhattan_to(this._nearest_enemy)) {
          this._nearest_enemy = e;
        }
      }
    }
  }
  update() {
    this._count++;
    if (this._count % 30 === 0) this.update_nearest(); // pre 0.5 second.

    const c = this.character;
    const { x, z } = c.position;
    const { x: end_x, z: end_z } = this._nearest_enemy?.position || c.position;
    const DEAD_ZONE = 50;
    const RUN_ZONE = 600;
    const { facing } = c;
    const { state } = c.get_frame();
    const is_running = state === Defines.State.Running
    if (end_x - x > DEAD_ZONE) this.start(GameKey.R).end(GameKey.L)
    else if (x - end_x > DEAD_ZONE) this.start(GameKey.L).end(GameKey.R)
    else if (is_running && facing > 0) this.start(GameKey.L).end(GameKey.R) // stop running.
    else if (is_running && facing < 0) this.start(GameKey.R).end(GameKey.L) // stop running.
    else this.end(GameKey.L, GameKey.R) // reach x

    // too far, run.
    if (end_x - x > RUN_ZONE && !is_running) this.db_hit(GameKey.R);
    else if (x - end_x > RUN_ZONE && !is_running) this.db_hit(GameKey.L);

    if (z < end_z - DEAD_ZONE) {
      if (this.is_end(GameKey.D)) {
        this.start(GameKey.D).end(GameKey.U)
      }
    } else if (z > end_z + DEAD_ZONE) {
      if (this.is_end(GameKey.U)) {
        this.start(GameKey.U).end(GameKey.D)
      }
    } else {
      // reach z
      this.end(GameKey.D, GameKey.U)
    }
    return super.update();
  }
}
