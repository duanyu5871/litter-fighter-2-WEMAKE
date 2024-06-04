import { Defines } from "../defines/defines";
import Character from "../entity/Character";
import Entity from "../entity/Entity";
import Weapon from "../entity/Weapon";
import { is_character } from "../entity/type_check";
import { BaseController, KeyName } from "./BaseController";

export class BotEnemyChaser extends BaseController {
  readonly is_bot_enemy_chaser = true;
  static is = (v: any): v is BotEnemyChaser => v?.is_bot_enemy_chaser === true

  _count = 0;
  _nearest_enemy: Character | undefined;
  _nearest_friend: Character | undefined;
  _nearest_weapon: Weapon | undefined;
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
      } else {
        if (!this._nearest_friend) {
          this._nearest_friend = e;
        } else if (this.manhattan_to(e) > this.manhattan_to(this._nearest_friend)) {
          this._nearest_friend = e;
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
    if (end_x - x > DEAD_ZONE) this.start(KeyName.R).end(KeyName.L)
    else if (x - end_x > DEAD_ZONE) this.start(KeyName.L).end(KeyName.R)
    else if (is_running && facing > 0) this.start(KeyName.L).end(KeyName.R) // stop running.
    else if (is_running && facing < 0) this.start(KeyName.R).end(KeyName.L) // stop running.
    else this.end(KeyName.L, KeyName.R) // reach x

    // too far, run.
    if (end_x - x > RUN_ZONE && !is_running) this.db_hit(KeyName.R);
    else if (x - end_x > RUN_ZONE && !is_running) this.db_hit(KeyName.L);

    if (z < end_z - DEAD_ZONE) this.start(KeyName.D).end(KeyName.U)
    else if (z > end_z + DEAD_ZONE) this.start(KeyName.U).end(KeyName.D)
    else this.end(KeyName.D, KeyName.U) // reach z

    return super.update();
  }
}
