import GameKey from "../defines/GameKey";
import { Defines } from "../defines/defines";
import Character from "../entity/Character";
import Entity from "../entity/Entity";
import { is_character } from "../entity/type_check";
import { BaseController } from "./BaseController";

export class BotController extends BaseController {
  readonly is_bot_enemy_chaser = true;
  _count = 0;
  _chasing_enemy: Character | undefined;
  _avoiding_enemy: Character | undefined;
  manhattan_to(a: Entity) {
    const { x, z } = this.entity.position;
    const { x: x1, z: z1 } = a.position;
    return Math.abs(x1 - x) + Math.abs(z1 - z);
  }
  should_avoid(e?: Character | null) {
    if (!e) return true;
    return (
      e.frame.state === Defines.State.Lying ||
      e.invisible ||
      e.blinking
    )
  }
  update_nearest() {
    const c = this.entity;
    if (this.should_avoid(this._chasing_enemy)) {
      this._chasing_enemy = void 0;
    }
    if (!this.should_avoid(this._avoiding_enemy)) {
      this._avoiding_enemy = void 0;
    }
    for (const e of c.world.entities) {
      if (!is_character(e) || c.same_team(e))
        continue;
      if (this.should_avoid(e)) {
        if (!this._avoiding_enemy) {
          this._avoiding_enemy = e;
        } else if (this.manhattan_to(e) < this.manhattan_to(this._avoiding_enemy)) {
          this._avoiding_enemy = e;
        }
      } else {
        if (!this._chasing_enemy) {
          this._chasing_enemy = e;
        } else if (this.manhattan_to(e) < this.manhattan_to(this._chasing_enemy)) {
          this._chasing_enemy = e;
        }
      }
    }
  }
  want_to_jump = false;

  chase_enemy() {
    if (!this._chasing_enemy) return false;
    const c = this.entity;
    const { x, z } = c.position;
    const {
      x: target_x,
      z: target_z,
    } = this._chasing_enemy.position;

    const WALK_ATTACK_DEAD_ZONE_X = 50;
    const WALK_ATTACK_DEAD_ZONE_Z = 10;
    const RUN_ATTACK_DEAD_ZONE_X = 75;
    const RUN_ATTACK_DEAD_ZONE_Z = 10;
    const JUMP_DESIRE = 1
    const RUN_ZONE = 300;
    const { facing } = c;
    const { state } = c.get_frame();
    const is_running = state === Defines.State.Running
    let is_x_reach = false;
    let is_z_reach = false;

    if (target_x - x > RUN_ZONE && !is_running) {
      this.db_hit(GameKey.R)
      // console.log('run >>>', this.is_db_hit(GameKey.R))
    } else if (x - target_x > RUN_ZONE && !is_running) {
      this.db_hit(GameKey.L)
      // console.log('run <<<', this.is_db_hit(GameKey.L))
    } else if (is_running) {
      if (target_x - x > RUN_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L)
        }
      } else if (x - target_x > RUN_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.L)) {
          this.start(GameKey.L).end(GameKey.R)
        }
      } else {
        is_x_reach = true;
      }
    } else {
      if (target_x - x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L)
        }
      } else if (x - target_x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.L)) {
          this.start(GameKey.L).end(GameKey.R)
        }
      } else {
        is_x_reach = true;
      }
    }
    if (z < target_z - WALK_ATTACK_DEAD_ZONE_Z) {
      if (this.is_end(GameKey.D)) {
        this.start(GameKey.D).end(GameKey.U)
      }
    } else if (z > target_z + WALK_ATTACK_DEAD_ZONE_Z) {
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

      if (z < target_z) {
        if (this.is_end(GameKey.D)) {
          this.start(GameKey.D).end(GameKey.U)
        }
      } else if (z > target_z) {
        if (this.is_end(GameKey.U)) {
          this.start(GameKey.U).end(GameKey.D)
        }
      }
      if (target_x - x > 0) {
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L)
        }
      } else if (x - target_x > 0) {
        if (this.is_end(GameKey.L)) {
          this.start(GameKey.L).end(GameKey.R)
        }
      }
      
      // 上来就一拳。
      this.is_hit(GameKey.a) ?
        this.end(GameKey.a) :
        this.start(GameKey.a)
      this.want_to_jump = false;
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
    return true
  }
  avoid_enemy() {
    // console.log('avoid_enemy')
    if (!this._avoiding_enemy) return false;

    const c = this.entity;
    const { x, z } = c.position;
    const { x: target_x, z: target_z } = this._avoiding_enemy.position;

    if (this.manhattan_to(this._avoiding_enemy) > 200) {
      this.end(GameKey.L, GameKey.R, GameKey.U, GameKey.D)
      return true;
    }
    // const { near, far } = this.world.bg;
    let is_x_reach = false;
    let is_z_reach = false;
    if (target_x < x) {
      if (this.is_end(GameKey.R)) {
        this.start(GameKey.R).end(GameKey.L)
      }
    } else {
      if (this.is_end(GameKey.L)) {
        this.start(GameKey.L).end(GameKey.R)
      }
    }

    if (z < target_z) {
      if (this.is_end(GameKey.U)) {
        this.start(GameKey.U).end(GameKey.D)
      }
    } else {
      if (this.is_end(GameKey.D)) {
        this.start(GameKey.D).end(GameKey.U)
      }
    }

    if (is_x_reach) {
      this.end(GameKey.L, GameKey.R)
    }
    if (is_z_reach) {
      this.end(GameKey.U, GameKey.D)
    }
    return true;
  }
  update() {
    this._count++;
    if (this._count % 10 === 0) this.update_nearest();
    this.chase_enemy() || this.avoid_enemy()
    return super.update();
  }
}
