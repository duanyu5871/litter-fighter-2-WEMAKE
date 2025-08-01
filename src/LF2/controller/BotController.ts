import { Builtin_FrameId, GameKey as GK, StateEnum, TLooseGameKey } from "../defines";
import { Entity } from "../entity/Entity";
import { is_character } from "../entity/type_check";
import { abs } from "../utils";
import { BaseController } from "./BaseController";
import { dummy_updaters, DummyEnum } from "./DummyEnum";

export class BotController extends BaseController {
  static W_ATK_ZONE_X = 50;
  static W_ATK_ZONE_Z = 10;
  static R_ATK_ZONE_X = 120;
  static JUMP_DESIRE = 5;
  static RUN_DESIRE = 5;
  static STOP_RUN_DESIRE = 5;
  static RUN_ZONE = 300;

  readonly is_bot_enemy_chaser = true;
  W_ATK_ZONE_X = BotController.W_ATK_ZONE_X;
  W_ATK_ZONE_Z = BotController.W_ATK_ZONE_Z;
  JUMP_DESIRE = BotController.JUMP_DESIRE;
  RUN_DESIRE = BotController.RUN_DESIRE;
  STOP_RUN_DESIRE = BotController.STOP_RUN_DESIRE;
  RUN_ZONE_X = BotController.RUN_ZONE;

  _count = 0;
  chasing_enemy: Entity | undefined;
  avoiding_enemy: Entity | undefined;
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
    return abs(x1 - x) + abs(z1 - z);
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

  protected key_up(...ks: TLooseGameKey[]): this {
    for (const k of ks) this.is_end(k) || this.end(k)
    return this;
  }

  protected key_down(...ks: TLooseGameKey[]): this {
    for (const k of ks) this.is_end(k) && this.start(k)
    return this;
  }
  desire() {
    return this.lf2.random_in(0, 10000)
  }

  chase_enemy() {
    if (!this.chasing_enemy) return false;
    const me = this.entity;
    const { x: my_x, z: my_z } = this.guess_entity_pos(me);
    const { x: en_x, z: en_z } = this.guess_entity_pos(this.chasing_enemy);
    const { state } = me.frame;
    let x_reach = false;
    let z_reach = false;

    switch (state) {
      case StateEnum.Standing:
      case StateEnum.Walking: {
        if (my_x < en_x - this.RUN_ZONE_X) {
          if (this.desire() < this.RUN_DESIRE)
            this.key_up(GK.L, GK.R).db_hit(GK.R).end(GK.R);
        } else if (my_x > en_x + this.RUN_ZONE_X) {
          if (this.desire() < this.RUN_DESIRE)
            this.key_up(GK.L, GK.R).db_hit(GK.L).end(GK.L);
        }
        break;
      }
    }

    if (state === StateEnum.Running) {
      // STOP RUNNING.
      if (abs(en_x - my_x) < this.W_ATK_ZONE_X || this.desire() < this.STOP_RUN_DESIRE) {
        this.entity.facing < 0 ?
          this.key_down(GK.R).key_up(GK.L) :
          this.key_down(GK.L).key_up(GK.R)
      }
      if (state !== StateEnum.Running) {
        this.key_up(GK.R, GK.L);
      }
    }

    if (my_x < en_x - this.W_ATK_ZONE_X) {
      this.key_up(GK.L).key_down(GK.R);
    } else if (my_x > en_x + this.W_ATK_ZONE_X) {
      this.key_up(GK.R).key_down(GK.L);
    } else {
      this.key_up(GK.L, GK.R);
      x_reach = true;
    }
    if (my_z < en_z - this.W_ATK_ZONE_Z) {
      this.key_up(GK.U).key_down(GK.D);
    } else if (my_z > en_z + this.W_ATK_ZONE_Z) {
      this.key_up(GK.D).key_down(GK.U);
    } else {
      this.key_up(GK.U, GK.D);
      z_reach = true;
    }
    if (x_reach && z_reach) {
      if (my_x > en_x && this.entity.facing > 0) {
        this.key_down(GK.L).key_up(GK.L); // 回头
      } else if (my_x < en_x && this.entity.facing < 0) {
        this.key_down(GK.R).key_up(GK.R); // 回头
      }
      this.key_down(GK.a).key_up(GK.a)
    }
    switch (state) {
      case StateEnum.Standing:
      case StateEnum.Walking:
      case StateEnum.Running: {
        if (this.desire() < this.JUMP_DESIRE) {
          this.key_down(GK.j).end(GK.j)
        }
        break;
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
