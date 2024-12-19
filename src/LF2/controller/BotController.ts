import GameKey from "../defines/GameKey";
import { Defines } from "../defines/defines";
import Entity from "../entity/Entity";
import { is_character } from "../entity/type_check";
import { BaseController } from "./BaseController";

export class BotController extends BaseController {
  readonly is_bot_enemy_chaser = true;
  _count = 0;
  chasing_enemy: Entity | undefined;
  avoiding_enemy: Entity | undefined;
  want_to_jump = false;
  private _dummy?: number;
  get dummy(): number | undefined {
    return this._dummy;
  }
  set dummy(v) {
    this.end(...Object.values(GameKey))
    this._dummy = v;
  }
  manhattan_to(a: Entity) {
    const { x, z } = this.entity.position;
    const { x: x1, z: z1 } = a.position;
    return Math.abs(x1 - x) + Math.abs(z1 - z);
  }
  should_avoid(e?: Entity | null) {
    if (!e)
      return false;
    if (e.frame.id === Defines.FrameId.Gone)
      return false
    return e.hp > 0 && (
      e.frame.state === Defines.State.Lying ||
      e.invisible ||
      e.blinking
    )
  }
  should_chase(e?: Entity | null) {
    if (!e)
      return false;
    if (e.frame.id === Defines.FrameId.Gone)
      return false
    return e.hp > 0 && (
      e.frame.state !== Defines.State.Lying &&
      !e.invisible &&
      !e.blinking
    )
  }
  update_nearest() {
    const c = this.entity;
    if (!this.should_chase(this.chasing_enemy)) {
      this.chasing_enemy = void 0;
    }
    if (!this.should_avoid(this.avoiding_enemy)) {
      this.avoiding_enemy = void 0;
    }
    for (const e of c.world.entities) {
      if (!is_character(e) || c.same_team(e))
        continue;
      if (this.should_avoid(e)) {
        if (!this.avoiding_enemy) {
          this.avoiding_enemy = e;
        } else if (this.manhattan_to(e) < this.manhattan_to(this.avoiding_enemy)) {
          this.avoiding_enemy = e;
        }
      } else if (this.should_chase(e)) {
        if (!this.chasing_enemy) {
          this.chasing_enemy = e;
        } else if (this.manhattan_to(e) < this.manhattan_to(this.chasing_enemy)) {
          this.chasing_enemy = e;
        }
      }
    }
  }

  chase_enemy() {
    if (!this.chasing_enemy) return false;
    const me = this.entity;
    const { x: my_x, z: my_z } = me.position;
    const {
      x: target_x,
      z: target_z,
    } = this.chasing_enemy.position;

    const WALK_ATTACK_DEAD_ZONE_X = 50;
    const WALK_ATTACK_DEAD_ZONE_Z = 10;
    const RUN_ATTACK_DEAD_ZONE_X = 75;
    const RUN_ATTACK_DEAD_ZONE_Z = 10;
    const JUMP_DESIRE = 1
    const RUN_ZONE = 300;
    const { facing } = me;
    const { state } = me.frame;
    const is_running = state === Defines.State.Running
    let is_x_reach = false;
    let is_z_reach = false;

    if (target_x - my_x > RUN_ZONE && !is_running) {
      this.db_hit(GameKey.R)
      // console.log('run >>>', this.is_db_hit(GameKey.R))
    } else if (my_x - target_x > RUN_ZONE && !is_running) {
      this.db_hit(GameKey.L)
      // console.log('run <<<', this.is_db_hit(GameKey.L))
    } else if (is_running) {
      if (target_x - my_x > RUN_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L)
        }
      } else if (my_x - target_x > RUN_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.L)) {
          this.start(GameKey.L).end(GameKey.R)
        }
      } else {
        is_x_reach = true;
      }
    } else {
      if (target_x - my_x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L)
        }
      } else if (my_x - target_x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.L)) {
          this.start(GameKey.L).end(GameKey.R)
        }
      } else {
        is_x_reach = true;
      }
    }
    if (my_z < target_z - WALK_ATTACK_DEAD_ZONE_Z) {
      if (this.is_end(GameKey.D)) {
        this.start(GameKey.D).end(GameKey.U)
      }
    } else if (my_z > target_z + WALK_ATTACK_DEAD_ZONE_Z) {
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
      if (my_z < target_z) {
        if (this.is_end(GameKey.D)) {
          this.start(GameKey.D).end(GameKey.U)
        }
      } else if (my_z > target_z) {
        if (this.is_end(GameKey.U)) {
          this.start(GameKey.U).end(GameKey.D)
        }
      }
      if (my_x < target_x && me.facing === -1) {
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L)
        }
      } else if (target_x < my_x && me.facing === 1) {
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
    if (!this.avoiding_enemy) return false;

    const c = this.entity;
    const { x, z } = c.position;
    const { x: target_x, z: target_z } = this.avoiding_enemy.position;

    if (this.manhattan_to(this.avoiding_enemy) > 200) {
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

  override update() {
    switch (this._dummy) {
      case void 0: {
        if (this.time % 10 === 0) this.update_nearest();
        this.chase_enemy() || this.avoid_enemy()
        break;
      }
      case 1: {
        if (this.entity.frame.state === Defines.State.Standing && this.entity.resting <= 0) {
          this.entity.position.x = this.world.bg.width / 2;
          this.entity.position.z = (this.world.bg.near + this.world.far) / 2
        }
        break;
      }
      case 2: {
        if (this.entity.frame.state === Defines.State.Standing && this.entity.resting <= 0) {
          this.entity.position.x = this.world.bg.width / 2;
          this.entity.position.z = (this.world.bg.near + this.world.far) / 2
        }
        this.start(GameKey.d)
        break;
      }
      case 3: {
        if (this.entity.frame.state === Defines.State.Standing && this.entity.resting <= 0) {
          this.entity.position.x = this.world.bg.width / 2;
          this.entity.position.z = (this.world.bg.near + this.world.far) / 2
        }
        if (this.entity.frame.state === Defines.State.Falling) {
          this.start(GameKey.j)
        }
        break;
      }
      case 4: {
        if (this.entity.frame.state === Defines.State.Standing && this.entity.resting <= 0) {
          this.entity.position.x = this.world.bg.width / 2;
          this.entity.position.z = (this.world.bg.near + this.world.far) / 2
        }
        if (this.entity.frame.state === Defines.State.Standing && this.time % 60 === 0) {
          this.start(GameKey.d, GameKey.U, GameKey.a)
        } else {
          this.end(GameKey.d, GameKey.U, GameKey.a)
        }
        break;
      }
      case 5: {
        if (this.entity.frame.state === Defines.State.Standing) {
          this.entity.position.x = this.world.bg.width / 2;
          this.entity.position.z = (this.world.bg.near + this.world.far) / 2
          this.start(GameKey.j)
        } else if (this.entity.frame.state === Defines.State.Falling) {
          this.start(GameKey.j)
        } else {
          this.end(GameKey.j)
        }

        break;
      }
      default:
        break;
    }
    return super.update();
  }
}
