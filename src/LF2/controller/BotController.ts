import { Builtin_FrameId, GameKey as GK, StateEnum, TLooseGameKey } from "../defines";
import { Entity } from "../entity/Entity";
import { is_character } from "../entity/type_check";
import { BaseController } from "./BaseController";
import { dummy_updaters, DummyEnum } from "./DummyEnum";

export class BotController extends BaseController {
  readonly is_bot_enemy_chaser = true;
  _count = 0;
  chasing_enemy: Entity | undefined;
  avoiding_enemy: Entity | undefined;
  want_to_jump = false;
  private _dummy?: DummyEnum;
  get dummy(): DummyEnum | undefined {
    return this._dummy;
  }
  set dummy(v) {
    this.end(...Object.values(GK));
    this._dummy = v;
  }
  manhattan_to(a: Entity) {
    const { x, z } = this.entity.position;
    const { x: x1, z: z1 } = a.position;
    return Math.abs(x1 - x) + Math.abs(z1 - z);
  }
  should_avoid(e?: Entity | null) {
    if (!e) return false;
    if (e.frame.id === Builtin_FrameId.Gone) return false;
    return (
      e.hp > 0 &&
      (e.frame.state === StateEnum.Lying || e.invisible || e.blinking)
    );
  }
  should_chase(e?: Entity | null) {
    if (!e) return false;
    if (e.frame.id === Builtin_FrameId.Gone) return false;
    return (
      e.hp > 0 &&
      e.frame.state !== StateEnum.Lying &&
      !e.invisible &&
      !e.blinking
    );
  }
  update_nearest() {
    if (this.time % 10 !== 0) return;
    const c = this.entity;
    if (c.hp <= 0) return;
    if (!this.should_chase(this.chasing_enemy)) {
      this.chasing_enemy = void 0;
    }
    if (!this.should_avoid(this.avoiding_enemy)) {
      this.avoiding_enemy = void 0;
    }
    for (const e of c.world.entities) {
      if (!is_character(e) || c.is_ally(e)) continue;
      if (this.should_avoid(e)) {
        if (!this.avoiding_enemy) {
          this.avoiding_enemy = e;
        } else if (
          this.manhattan_to(e) < this.manhattan_to(this.avoiding_enemy)
        ) {
          this.avoiding_enemy = e;
        }
      } else if (this.should_chase(e)) {
        if (!this.chasing_enemy) {
          this.chasing_enemy = e;
        } else if (
          this.manhattan_to(e) < this.manhattan_to(this.chasing_enemy)
        ) {
          this.chasing_enemy = e;
        }
      }
    }
    if (this.dummy === DummyEnum.AvoidEnemyAllTheTime) {
      this.avoiding_enemy = this.chasing_enemy;
    }
  }

  guess_entity_pos(entity: Entity) {
    const { x: px, z: pz } = entity.position;
    const { x: vx, z: vz } = entity.velocity;
    let x = px + vx;
    let z = pz + vz;
    switch (entity.frame.state) {
      case StateEnum.Jump:
        x += 2 * vx;
        z += 2 * vz;
        break;
      case StateEnum.Running:
        x += 4 * vx;
        z += 4 * vz;
        break;
      case StateEnum.Dash:
        x += 8 * vx;
        z += 8 * vz;
        break;
    }
    return { x: px, z: pz, next_x: x, next_z: z };
  }

  chase_enemy() {
    if (!this.chasing_enemy) return false;

    const me = this.entity;
    const { x: my_x, z: my_z } = this.guess_entity_pos(me);
    const { x: enemy_x, z: enemy_z } = this.guess_entity_pos(this.chasing_enemy);

    const WALK_ATTACK_DEAD_ZONE_X = 50;
    const WALK_ATTACK_DEAD_ZONE_Z = 10;
    const RUN_ATTACK_DEAD_ZONE_X = 75;
    const RUN_ATTACK_DEAD_ZONE_Z = 10;
    const JUMP_DESIRE = 1;
    const RUN_ZONE = 300;
    const { facing } = me;
    const { state } = me.frame;
    const is_running = state === StateEnum.Running;
    let is_x_reach = false;
    let is_z_reach = false;

    if (enemy_x - my_x > RUN_ZONE && !is_running) {
      this.db_hit("R");
      // console.log('run >>>', this.is_db_hit(GameKey.R))
    } else if (my_x - enemy_x > RUN_ZONE && !is_running) {
      this.db_hit("L");
      // console.log('run <<<', this.is_db_hit(GameKey.L))
    } else if (is_running) {
      if (enemy_x - my_x > RUN_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GK.R)) {
          this.start(GK.R).end(GK.L);
        }
      } else if (my_x - enemy_x > RUN_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GK.L)) {
          this.start(GK.L).end(GK.R);
        }
      } else {
        is_x_reach = true;
      }
    } else {
      if (enemy_x - my_x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GK.R)) {
          this.start(GK.R).end(GK.L);
        }
      } else if (my_x - enemy_x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GK.L)) {
          this.start(GK.L).end(GK.R);
        }
      } else {
        is_x_reach = true;
      }
    }
    if (my_z < enemy_z - WALK_ATTACK_DEAD_ZONE_Z) {
      if (this.is_end(GK.D)) {
        this.start(GK.D).end(GK.U);
      }
    } else if (my_z > enemy_z + WALK_ATTACK_DEAD_ZONE_Z) {
      if (this.is_end(GK.U)) {
        this.start(GK.U).end(GK.D);
      }
    } else {
      is_z_reach = true;
    }

    if (is_z_reach) {
      this.end(GK.D, GK.U);
    }
    if (is_x_reach && is_z_reach) {
      if (
        this.entity.frame.state === StateEnum.Standing ||
        this.entity.frame.state === StateEnum.Walking
      ) {
        if (my_z < enemy_z + 10) {
          if (this.is_end(GK.D)) {
            this.start(GK.D).end(GK.U);
          }
        } else if (my_z > enemy_z - 10) {
          if (this.is_end(GK.U)) {
            this.start(GK.U).end(GK.D);
          }
        } else {
          this.end(GK.U, GK.D);
        }
        if (my_x < enemy_x + 10 && me.facing === -1) {
          if (this.is_end(GK.R)) {
            this.start(GK.R).end(GK.L);
          }
        } else if (enemy_x < my_x - 10 && me.facing === 1) {
          if (this.is_end(GK.L)) {
            this.start(GK.L).end(GK.R);
          }
        } else {
          this.end(GK.L, GK.R);
        }
      }
      // 上来就一拳。
      this.is_hit(GK.a) ? this.end(GK.a) : this.start(GK.a);
      this.want_to_jump = false;
    } else {
      if (is_x_reach) {
        if (is_running && facing > 0) {
          this.start(GK.L).end(GK.R); // stop running.
        } else if (is_running && facing < 0) {
          this.start(GK.R).end(GK.L); // stop running.
        } else {
          this.end(GK.L, GK.R);
        }
      }
      if (!this.want_to_jump)
        this.want_to_jump = Math.random() * 100 < JUMP_DESIRE;
      if (this.want_to_jump) {
        if (this.is_hit(GK.j)) {
          this.want_to_jump = false;
          this.end(GK.j);
        } else {
          this.start(GK.j);
        }
      }
    }
    return true;
  }
  avoid_enemy() {
    if (!this.avoiding_enemy) return false;

    const c = this.entity;
    const { x, z } = c.position;
    const { x: enemy_x, z: enemy_z } = this.avoiding_enemy.position;
    const distance = this.manhattan_to(this.avoiding_enemy);
    if (distance > 200) {
      this.end(GK.L, GK.R, GK.U, GK.D);
      return true;
    }

    const { left, right, near, far } = this.lf2.world.bg;

    let x_d: 0 | -1 | 1 = 0;
    if (enemy_x <= x) {
      x_d = enemy_x < right - 200 ? 1 : -1;
    } else {
      x_d = enemy_x > left + 200 ? -1 : 1;
    }
    switch (x_d) {
      case 1:
        if (distance < 25) this.db_hit(GK.R).end(GK.L);
        else this.is_end(GK.R) && this.start(GK.R).end(GK.L);
        break;
      case -1:
        if (distance < 25) this.db_hit(GK.L).end(GK.R);
        else this.is_end(GK.L) && this.start(GK.L).end(GK.R);
        break;
    }

    let z_d: 0 | -1 | 1 = 0;
    if (z <= enemy_z) {
      z_d = enemy_z > far + 50 ? 1 : -1;
    } else {
      z_d = enemy_z < near - 50 ? -1 : 1;
    }
    switch (z_d) {
      case 1:
        this.is_end(GK.U) && this.start(GK.U).end(GK.D);
        break;
      case -1:
        this.is_end(GK.D) && this.start(GK.D).end(GK.U);
        break;
    }

    return true;
  }

  override update() {
    if (this.dummy) {
      dummy_updaters[this.dummy]?.update(this);
    } else {
      this.update_nearest();
      this.chase_enemy()
      this.avoid_enemy()
    }
    return super.update();
  }
  lock_when_stand_and_rest() {
    if (
      this.entity.frame.state === StateEnum.Standing &&
      this.entity.resting <= 0
    ) {
      this.entity.position.x = this.world.bg.width / 2;
      this.entity.position.z = (this.world.bg.near + this.world.far) / 2;
      return true;
    }
    return false;
  }
}
