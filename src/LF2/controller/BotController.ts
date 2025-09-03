import FSM from "../base/FSM";
import { Builtin_FrameId, Defines, GameKey as GK, StateEnum, TLooseGameKey } from "../defines";
import { IBotAction } from "../defines/IBotAction";
import { IBotDataSet } from "../defines/IBotDataSet";
import { is_ai_ray_hit } from "../defines/is_ai_ray_hit";
import { Entity } from "../entity/Entity";
import { is_character } from "../entity/type_check";
import { manhattan_xz } from "../helper/manhattan_xz";
import { abs, clamp, floor } from "../utils";
import { BaseController, KEY_NAME_LIST } from "./BaseController";
import { BotCtrlState } from "./BotCtrlState";
import { BotCtrlState_Avoiding } from "./BotCtrlState_Avoiding";
import { BotCtrlState_Chasing } from "./BotCtrlState_Chasing";
import { BotCtrlState_Standing } from "./BotCtrlState_Standing";
import { dummy_updaters, DummyEnum } from "./DummyEnum";

export class BotController extends BaseController implements Required<IBotDataSet> {
  readonly fsm = new FSM<BotCtrlState>()
    .add(
      new BotCtrlState_Standing(this),
      new BotCtrlState_Chasing(this),
      new BotCtrlState_Avoiding(this)
    )
    .use(BotCtrlState.Standing)

  readonly is_bot_enemy_chaser = true;

  /** 走攻触发范围X(敌人正对) */
  w_atk_f_x = Defines.AI_W_ATK_F_X;
  /** 走攻触发范围X(敌人背对) */
  w_atk_b_x = Defines.AI_W_ATK_B_X;
  /** 走攻触发范围Z */
  w_atk_z = Defines.AI_W_ATK_Z;
  /** 走攻触发范围X */
  get w_atk_x() {
    if (!this.chasing) return 0;
    return this.entity.facing === this.chasing.facing ?
      this.w_atk_f_x :
      this.w_atk_b_x;
  }


  /** 跑攻欲望值 */
  r_atk_desire = Defines.AI_R_ATK_DESIRE;
  /** 跑攻触发范围X(敌人正对) */
  r_atk_f_x = Defines.AI_R_ATK_F_X;
  /** 跑攻触发范围X(敌人背对) */
  r_atk_b_x = Defines.AI_R_ATK_F_X;
  /** 跑攻触发范围Z */
  r_atk_z = Defines.AI_R_ATK_Z;
  /** 跑攻触发范围X */
  get r_atk_x() {
    if (!this.chasing) return 0;
    return this.entity.facing === this.chasing.facing ? this.r_atk_b_x : this.r_atk_f_x;
  }

  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_f_x = Defines.AI_D_ATK_F_X;
  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_b_x = Defines.AI_D_ATK_B_X;
  /** 冲跳攻触发范围Z */
  d_atk_z = Defines.AI_D_ATK_Z;
  /** 冲跳攻触发范围X */
  get d_atk_x() {
    if (!this.chasing) return 0;
    return this.entity.facing === this.chasing.facing ? this.d_atk_b_x : this.d_atk_f_x;
  }

  /** 跳攻触发范围X(敌人正对) */
  j_atk_f_x = Defines.AI_J_ATK_F_X;
  /** 跳攻触发范围X(敌人正对) */
  j_atk_b_x = Defines.AI_J_ATK_B_X;
  /** 跳攻触发范围Z */
  j_atk_z = Defines.AI_J_ATK_Z;
  /** 跳攻触发范围Y */
  j_atk_y_min = Defines.AI_J_ATK_Y_MIN;
  j_atk_y_max = Defines.AI_J_ATK_Y_MAX;
  /** 跳攻触发范围X */
  get j_atk_x() {
    if (!this.chasing) return 0;
    return this.entity.facing === this.chasing.facing ? this.j_atk_b_x : this.j_atk_f_x;
  }

  jump_desire = Defines.AI_J_DESIRE;
  dash_desire = Defines.AI_D_DESIRE;

  /** 最小欲望值：跑步 */
  r_desire_min = Defines.AI_R_DESIRE_MIN;

  /** 最大欲望值：跑步 */
  r_desire_max = Defines.AI_R_DESIRE_MAX;

  /** 
   * 最小起跑范围X 
   * 距离敌人小于于等于此距离时，此时奔跑欲望值最小
   */
  r_x_min = Defines.AI_R_X_MIN;

  /** 
   * 最大起跑范围X 
   * 距离敌人大于等于此距离时，此时奔跑欲望值最大
   */
  r_x_max = Defines.AI_R_X_MAX;

  get r_desire(): -1 | 1 | 0 {
    if (!this.chasing) return 0;
    let dx = abs(this.entity.position.x - this.chasing.position.x) - this.r_x_min
    if (dx < 0) return 0;
    let should_run = false
    const r_x_r = this.r_x_max - this.r_x_min
    if (r_x_r === 0) {
      dx = floor(clamp(dx, 0, r_x_r) / r_x_r)
      should_run = this.desire() <
        this.r_desire_min + (this.r_desire_max - this.r_desire_min) * dx;
    } else {
      should_run = this.desire() < this.r_x_min;
    }
    if (!should_run) return 0;
    return this.entity.position.x > this.chasing.position.x ? -1 : 1
  }

  /** 欲望值：停止跑步 */
  r_stop_desire = Defines.AI_R_STOP_DESIRE;

  chasing: Entity | undefined;
  avoiding: Entity | undefined;
  private _dummy?: DummyEnum;
  get dummy(): DummyEnum | undefined {
    return this._dummy;
  }
  set dummy(v) {
    this.end(...Object.values(GK));
    this._dummy = v;
  }
  constructor(player_id: string, entity: Entity) {
    super(player_id, entity);
    Object.assign(this, entity.data.base.bot?.dataset)
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
      e.hp > 0 && manhattan_xz(this.entity, e) < 200 &&
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
    if (this.time % 5 !== 0) return;
    const c = this.entity;
    if (c.hp <= 0) return;
    if (!this.should_chase(this.chasing)) {
      this.chasing = void 0;
    }
    if (!this.should_avoid(this.avoiding)) {
      this.avoiding = void 0;
    }
    for (const e of c.world.entities) {
      if (!is_character(e) || c.is_ally(e)) continue;
      if (this.should_avoid(e)) {
        if (!this.avoiding) {
          this.avoiding = e;
        } else if (
          this.manhattan_to(e) < this.manhattan_to(this.avoiding)
        ) {
          this.avoiding = e;
        }
      } else if (this.should_chase(e)) {
        if (!this.chasing) {
          this.chasing = e;
        } else if (
          this.manhattan_to(e) < this.manhattan_to(this.chasing)
        ) {
          this.chasing = e;
        }
      }
    }
    if (this.dummy === DummyEnum.AvoidEnemyAllTheTime) {
      this.avoiding = this.chasing;
    }
  }

  /**
   *  预判敌人位置(有点粗暴)
   */
  guess_entity_pos(entity: Entity) {
    const { x: px, z: pz, y: py } = entity.position;
    const { x: vx, z: vz, y: vy } = entity.velocity;
    let x = px + vx;
    let z = pz + vz;
    let y = py + vy;
    switch (entity.frame.state) {
      case StateEnum.Jump:
        x += 2 * vx;
        z += 1 * vz;
        y += 1 * vy;
        break;
      case StateEnum.Running:
        x += 3 * vx;
        z += 1.5 * vz;
        y += 1.5 * vy;
        break;
      case StateEnum.Dash:
        x += 4 * vx;
        z += 2 * vz;
        y += 2 * vy
        break;
    }
    return { x: px, z: pz, next_x: x, next_z: z, next_y: y };
  }

  key_up(...ks: TLooseGameKey[]): this {
    for (const k of ks) {
      if (!this.is_end(k)) {
        this.end(k)
      }
    }
    return this;
  }

  key_down(...ks: TLooseGameKey[]): this {
    for (const k of ks) {
      if (this.is_end(k)) {
        this.start(k)
      }
    }
    return this;
  }
  desire() {
    return this.lf2.random_in(0, Defines.MAX_AI_DESIRE)
  }
  avoid_enemy() {
    if (!this.avoiding) return false;

    const c = this.entity;
    const { x, z } = c.position;
    const { x: enemy_x, z: enemy_z } = this.avoiding.position;
    const distance = this.manhattan_to(this.avoiding);
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
    } else if (this.world.stage.is_stage_finish) {
      this.key_down(GK.R).key_up(...KEY_NAME_LIST)
    } else if (this.entity.hp <= 0) {
      this.key_up(...KEY_NAME_LIST)
    } else {
      this.fsm.update(1)
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

  handle_action(action: IBotAction | undefined): TLooseGameKey[] | false {
    if (!action) return false;
    const c = this;
    const { facing } = c.entity;
    const { status, e_ray, judger, desire = 10000, keys } = action


    if (c.desire() > desire) return false;
    if (status && !status.some(v => v === c.fsm.state?.key))
      return false;
    if (e_ray) {
      if (!c.chasing) return false;
      let ray_hit = false
      for (const r of e_ray) {
        ray_hit = is_ai_ray_hit(c.entity, c.chasing, r);
        if (ray_hit) break;
      }
      if (!ray_hit) return false;
    }

    if (judger && !judger.run(this))
      return false;
    const ks = keys.map<TLooseGameKey>(v => {
      if (v === 'F') return facing > 0 ? GK.R : GK.L;
      if (v === 'B') return facing > 0 ? GK.R : GK.L;
      return v
    })
    return ks;
  }
}
