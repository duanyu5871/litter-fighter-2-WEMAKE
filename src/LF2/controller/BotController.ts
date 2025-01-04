import GameKey from "../defines/GameKey";
import { Defines } from "../defines/defines";
import Entity from "../entity/Entity";
import { is_character } from "../entity/type_check";
import { BaseController } from "./BaseController";

export enum DummyEnum {
  LockAtMid_Stand = "1",
  LockAtMid_Defend = "2",
  LockAtMid_RowingWhenFalling = "3",
  LockAtMid_JumpAndRowingWhenFalling = "4",
  AvoidEnemyAllTheTime = "5",
  LockAtMid_dUa = "6",
  LockAtMid_dUj = "7",
  LockAtMid_dDa = "8",
  LockAtMid_dDj = "9",
  LockAtMid_dLa = "10",
  LockAtMid_dLj = "11",
  LockAtMid_dRa = "12",
  LockAtMid_dRj = "13",
  LockAtMid_dja = "14",
  LockAtMid_dUa_auto = "15",
  LockAtMid_dUj_auto = "16",
  LockAtMid_dDa_auto = "17",
  LockAtMid_dDj_auto = "18",
  LockAtMid_dLa_auto = "18",
  LockAtMid_dLj_auto = "19",
  LockAtMid_dRa_auto = "20",
  LockAtMid_dRj_auto = "21",
  LockAtMid_dja_auto = "22",
}
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
    this.end(...Object.values(GameKey));
    this._dummy = v;
  }
  manhattan_to(a: Entity) {
    const { x, z } = this.entity.position;
    const { x: x1, z: z1 } = a.position;
    return Math.abs(x1 - x) + Math.abs(z1 - z);
  }
  should_avoid(e?: Entity | null) {
    if (!e) return false;
    if (e.frame.id === Defines.FrameId.Gone) return false;
    return (
      e.hp > 0 &&
      (e.frame.state === Defines.State.Lying || e.invisible || e.blinking)
    );
  }
  should_chase(e?: Entity | null) {
    if (!e) return false;
    if (e.frame.id === Defines.FrameId.Gone) return false;
    return (
      e.hp > 0 &&
      e.frame.state !== Defines.State.Lying &&
      !e.invisible &&
      !e.blinking
    );
  }
  update_nearest() {
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
      case Defines.State.Jump:
        x += 2 * vx;
        z += 2 * vz;
        break;
      case Defines.State.Running:
        x += 4 * vx;
        z += 4 * vz;
        break;
      case Defines.State.Dash:
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
    const { x: enemy_x, z: enemy_z } = this.guess_entity_pos(
      this.chasing_enemy,
    );

    const WALK_ATTACK_DEAD_ZONE_X = 50;
    const WALK_ATTACK_DEAD_ZONE_Z = 10;
    const RUN_ATTACK_DEAD_ZONE_X = 75;
    const RUN_ATTACK_DEAD_ZONE_Z = 10;
    const JUMP_DESIRE = 1;
    const RUN_ZONE = 300;
    const { facing } = me;
    const { state } = me.frame;
    const is_running = state === Defines.State.Running;
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
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L);
        }
      } else if (my_x - enemy_x > RUN_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.L)) {
          this.start(GameKey.L).end(GameKey.R);
        }
      } else {
        is_x_reach = true;
      }
    } else {
      if (enemy_x - my_x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.R)) {
          this.start(GameKey.R).end(GameKey.L);
        }
      } else if (my_x - enemy_x > WALK_ATTACK_DEAD_ZONE_X) {
        if (this.is_end(GameKey.L)) {
          this.start(GameKey.L).end(GameKey.R);
        }
      } else {
        is_x_reach = true;
      }
    }
    if (my_z < enemy_z - WALK_ATTACK_DEAD_ZONE_Z) {
      if (this.is_end(GameKey.D)) {
        this.start(GameKey.D).end(GameKey.U);
      }
    } else if (my_z > enemy_z + WALK_ATTACK_DEAD_ZONE_Z) {
      if (this.is_end(GameKey.U)) {
        this.start(GameKey.U).end(GameKey.D);
      }
    } else {
      is_z_reach = true;
    }

    if (is_z_reach) {
      this.end(GameKey.D, GameKey.U);
    }
    if (is_x_reach && is_z_reach) {
      if (
        this.entity.frame.state === Defines.State.Standing ||
        this.entity.frame.state === Defines.State.Walking
      ) {
        if (my_z < enemy_z + 10) {
          if (this.is_end(GameKey.D)) {
            this.start(GameKey.D).end(GameKey.U);
          }
        } else if (my_z > enemy_z - 10) {
          if (this.is_end(GameKey.U)) {
            this.start(GameKey.U).end(GameKey.D);
          }
        } else {
          this.end(GameKey.U, GameKey.D);
        }
        if (my_x < enemy_x + 10 && me.facing === -1) {
          if (this.is_end(GameKey.R)) {
            this.start(GameKey.R).end(GameKey.L);
          }
        } else if (enemy_x < my_x - 10 && me.facing === 1) {
          if (this.is_end(GameKey.L)) {
            this.start(GameKey.L).end(GameKey.R);
          }
        } else {
          this.end(GameKey.L, GameKey.R);
        }
      }
      // 上来就一拳。
      this.is_hit(GameKey.a) ? this.end(GameKey.a) : this.start(GameKey.a);
      this.want_to_jump = false;
    } else {
      if (is_x_reach) {
        if (is_running && facing > 0) {
          this.start(GameKey.L).end(GameKey.R); // stop running.
        } else if (is_running && facing < 0) {
          this.start(GameKey.R).end(GameKey.L); // stop running.
        } else {
          this.end(GameKey.L, GameKey.R);
        }
      }
      if (!this.want_to_jump)
        this.want_to_jump = Math.random() * 100 < JUMP_DESIRE;
      if (this.want_to_jump) {
        if (this.is_hit(GameKey.j)) {
          this.want_to_jump = false;
          this.end(GameKey.j);
        } else {
          this.start(GameKey.j);
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
      this.end(GameKey.L, GameKey.R, GameKey.U, GameKey.D);
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
        if (distance < 25) this.db_hit(GameKey.R).end(GameKey.L);
        else this.is_end(GameKey.R) && this.start(GameKey.R).end(GameKey.L);
        break;
      case -1:
        if (distance < 25) this.db_hit(GameKey.L).end(GameKey.R);
        else this.is_end(GameKey.L) && this.start(GameKey.L).end(GameKey.R);
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
        this.is_end(GameKey.U) && this.start(GameKey.U).end(GameKey.D);
        break;
      case -1:
        this.is_end(GameKey.D) && this.start(GameKey.D).end(GameKey.U);
        break;
    }

    return true;
  }

  override update() {
    switch (this._dummy!) {
      case void 0: {
        if (this.time % 10 === 0) this.update_nearest();
        if (!this.chase_enemy() && !this.avoid_enemy()) {
          if (!this.is_end(GameKey.L)) this.end(GameKey.L);
          if (!this.is_end(GameKey.R)) this.end(GameKey.R);
          if (!this.is_end(GameKey.U)) this.end(GameKey.U);
          if (!this.is_end(GameKey.D)) this.end(GameKey.D);
        }
        break;
      }
      case DummyEnum.LockAtMid_Stand: {
        if (
          this.entity.frame.state === Defines.State.Standing &&
          this.entity.resting <= 0
        ) {
          this.entity.position.x = this.world.bg.width / 2;
          this.entity.position.z = (this.world.bg.near + this.world.far) / 2;
        }
        break;
      }
      case DummyEnum.LockAtMid_Defend: {
        if (
          this.entity.frame.state === Defines.State.Standing &&
          this.entity.resting <= 0
        ) {
          this.entity.position.x = this.world.bg.width / 2;
          this.entity.position.z = (this.world.bg.near + this.world.far) / 2;
        }
        this.start(GameKey.d);
        break;
      }
      case DummyEnum.LockAtMid_RowingWhenFalling: {
        if (
          this.entity.frame.state === Defines.State.Standing &&
          this.entity.resting <= 0
        ) {
          this.entity.position.x = this.world.bg.width / 2;
          this.entity.position.z = (this.world.bg.near + this.world.far) / 2;
        }
        if (this.entity.frame.state === Defines.State.Falling) {
          this.start(GameKey.j);
        }
        break;
      }

      case DummyEnum.LockAtMid_JumpAndRowingWhenFalling: {
        if (this.entity.frame.state === Defines.State.Standing) {
          this.entity.position.x = this.world.bg.width / 2;
          this.entity.position.z = (this.world.bg.near + this.world.far) / 2;
          this.start(GameKey.j);
        } else if (this.entity.frame.state === Defines.State.Falling) {
          this.start(GameKey.j);
        } else {
          this.end(GameKey.j);
        }
        break;
      }
      case DummyEnum.AvoidEnemyAllTheTime: {
        if (this.time % 10 === 0) this.update_nearest();
        this.avoid_enemy();
        break;
      }
      case DummyEnum.LockAtMid_dUa: {
        const h = this.lock_when_stand_and_rest();
        this[h ? "start" : "end"](GameKey.d, GameKey.U, GameKey.a);
        break;
      }
      case DummyEnum.LockAtMid_dUj: {
        const h = this.lock_when_stand_and_rest();
        this[h ? "start" : "end"](GameKey.d, GameKey.U, GameKey.j);
        break;
      }
      case DummyEnum.LockAtMid_dDa: {
        const h = this.lock_when_stand_and_rest();
        this[h ? "start" : "end"](GameKey.d, GameKey.D, GameKey.a);
        break;
      }
      case DummyEnum.LockAtMid_dDj: {
        const h = this.lock_when_stand_and_rest();
        this[h ? "start" : "end"](GameKey.d, GameKey.D, GameKey.j);
        break;
      }
      case DummyEnum.LockAtMid_dLa: {
        const h = this.lock_when_stand_and_rest();
        if (h) this.start(GameKey.d, GameKey.L, GameKey.a);
        else if (this.entity.frame.hit?.a) this.start(GameKey.a);
        else this[h ? "start" : "end"](GameKey.d, GameKey.L, GameKey.a);
        break;
      }
      case DummyEnum.LockAtMid_dLj: {
        const h = this.lock_when_stand_and_rest();
        this[h ? "start" : "end"](GameKey.d, GameKey.L, GameKey.j);
        break;
      }
      case DummyEnum.LockAtMid_dRa: {
        const h = this.lock_when_stand_and_rest();
        if (h) this.start(GameKey.d, GameKey.R, GameKey.a);
        else if (this.entity.frame.hit?.a) this.start(GameKey.a);
        else this[h ? "start" : "end"](GameKey.d, GameKey.R, GameKey.a);
        break;
      }
      case DummyEnum.LockAtMid_dRj: {
        const h = this.lock_when_stand_and_rest();
        this[h ? "start" : "end"](GameKey.d, GameKey.R, GameKey.j);
        break;
      }
      case DummyEnum.LockAtMid_dja: {
        const h = this.lock_when_stand_and_rest();
        this[h ? "start" : "end"](GameKey.d, GameKey.j, GameKey.a);
        break;
      }
      case DummyEnum.LockAtMid_dUa_auto:
      case DummyEnum.LockAtMid_dUj_auto:
      case DummyEnum.LockAtMid_dDa_auto:
      case DummyEnum.LockAtMid_dDj_auto:
      case DummyEnum.LockAtMid_dLj_auto:
      case DummyEnum.LockAtMid_dRa_auto:
      case DummyEnum.LockAtMid_dRj_auto:
      case DummyEnum.LockAtMid_dja_auto:
      default:
        break;
    }
    return super.update();
  }
  lock_when_stand_and_rest() {
    if (
      this.entity.frame.state === Defines.State.Standing &&
      this.entity.resting <= 0
    ) {
      this.entity.position.x = this.world.bg.width / 2;
      this.entity.position.z = (this.world.bg.near + this.world.far) / 2;
      return true;
    }
    return false;
  }
}
