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
  want_to_jump = false
  update() {
    this._count++;
    if (this._count % 30 === 0) this.update_nearest(); // pre 0.5 second.
    if (!this._nearest_enemy) return;
    const c = this.character;
    const { x, z } = c.position;
    const { x: end_x, z: end_z } = this._nearest_enemy.position;
    const WALK_ATTACK_DEAD_ZONE_X = 50;
    const WALK_ATTACK_DEAD_ZONE_Z = 10;
    const RUN_ATTACK_DEAD_ZONE_X = 75;
    const RUN_ATTACK_DEAD_ZONE_Z = 10;
    const JUMP_DESIRE = 5
    const RUN_ZONE = 300;
    const { facing } = c;
    const { state } = c.get_frame();
    const is_running = state === Defines.State.Running
    let is_x_reach = false;
    let is_z_reach = false;

    if (end_x - x > RUN_ZONE && !is_running) {
      this.db_hit(GameKey.R)
      console.log('run >>>', this.is_db_hit(GameKey.R))
    } else if (x - end_x > RUN_ZONE && !is_running) {
      this.db_hit(GameKey.L)
      console.log('run <<<', this.is_db_hit(GameKey.L))
    } else if (is_running) {
      if (end_x - x > RUN_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L)
        }
      } else if (x - end_x > RUN_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.L)) {
          this.start(GameKey.L).end(GameKey.R)
        }
      } else {
        is_x_reach = true;
      }
    } else {
      if (end_x - x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L)
        }
      } else if (x - end_x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.L)) {
          this.start(GameKey.L).end(GameKey.R)
        }
      } else {
        is_x_reach = true;
      }
    }



    if (z < end_z - WALK_ATTACK_DEAD_ZONE_Z) {
      if (this.is_end(GameKey.D)) {
        this.start(GameKey.D).end(GameKey.U)
      }
    } else if (z > end_z + WALK_ATTACK_DEAD_ZONE_Z) {
      if (this.is_end(GameKey.U)) {
        this.start(GameKey.U).end(GameKey.D)
      }
    } else {
      is_z_reach = true;
    }

    if (is_z_reach) {
      this.end(GameKey.D, GameKey.U)
    }
    if (is_x_reach && is_z_reach) {
      // 上来就一拳。
      this.is_hit(GameKey.a) ?
        this.end(GameKey.a) :
        this.start(GameKey.a)
    } else {
      if (is_x_reach) {
        if (is_running && facing > 0) {
          this.start(GameKey.L).end(GameKey.R) // stop running.
        } else if (is_running && facing < 0) {
          this.start(GameKey.R).end(GameKey.L) // stop running.
        } else {
          this.end(GameKey.L, GameKey.R)
        }
      }
      if (!this.want_to_jump)
        this.want_to_jump = Math.random() * 100 < JUMP_DESIRE
      if (this.want_to_jump) {
        if (this.is_hit(GameKey.j)) {
          this.want_to_jump = false;
          this.end(GameKey.j)
        } else {
          this.start(GameKey.j)
        }
      }
    }
    return super.update();
  }
}
