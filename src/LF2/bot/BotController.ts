import FSM from "../base/FSM";
import { BaseController, KEY_NAME_LIST } from "../controller/BaseController";
import {
  BotStateEnum,
  Builtin_FrameId, Defines,
  Difficulty,
  GK,
  IBotAction, IBotDataSet,
  ItrKind, LGK, StateEnum
} from "../defines";
import { Entity, is_ball, is_character, is_weapon } from "../entity";
import { manhattan_xz } from "../helper/manhattan_xz";
import { abs, clamp, floor } from "../utils";
import { DummyEnum, dummy_updaters } from "./DummyEnum";
import { NearestTargets } from "./NearestTargets";
import { BotState_Avoiding, BotState_Chasing, BotState_Idle } from "./state";
import { is_bot_ray_hit } from "./utils/is_bot_ray_hit";

export class BotController extends BaseController implements Required<IBotDataSet> {
  readonly fsm = new FSM<BotStateEnum>()
    .add(
      new BotState_Idle(this),
      new BotState_Chasing(this),
      new BotState_Avoiding(this)
    )
    .use(BotStateEnum.Idle)

  readonly is_bot_enemy_chaser = true;

  /** 走攻触发范围X(敌人正对) */
  w_atk_f_x = Defines.AI_W_ATK_F_X;
  /** 走攻触发范围X(敌人背对) */
  w_atk_b_x = Defines.AI_W_ATK_B_X;

  w_atk_m_x = Defines.AI_W_ATK_M_X;

  /** 走攻触发范围Z */
  w_atk_z = Defines.AI_W_ATK_Z;
  /** 走攻触发范围X */
  get w_atk_x() {
    const chasing = this.get_chasing()
    if (!chasing) return 0;
    return this.entity.facing === chasing.facing ?
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
    const chasing = this.get_chasing()
    if (!chasing) return 0;
    return this.entity.facing === chasing.facing ? this.r_atk_b_x : this.r_atk_f_x;
  }

  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_f_x = Defines.AI_D_ATK_F_X;
  /** 冲跳攻触发范围X(敌人正对) */
  d_atk_b_x = Defines.AI_D_ATK_B_X;
  /** 冲跳攻触发范围Z */
  d_atk_z = Defines.AI_D_ATK_Z;
  /** 冲跳攻触发范围X */
  get d_atk_x() {
    const chasing = this.get_chasing()
    if (!chasing) return 0;
    return this.entity.facing === chasing.facing ? this.d_atk_b_x : this.d_atk_f_x;
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
    const chasing = this.get_chasing()
    if (!chasing) return 0;
    return this.entity.facing === chasing.facing ? this.j_atk_b_x : this.j_atk_f_x;
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
    const chasing = this.get_chasing()
    if (!chasing) return 0;
    let dx = abs(this.entity.position.x - chasing.position.x) - this.r_x_min
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
    return this.entity.position.x > chasing.position.x ? -1 : 1
  }

  /** 欲望值：停止跑步 */
  r_stop_desire = Defines.AI_R_STOP_DESIRE;

  /** 防御 */
  d_desire = Defines.AI_DEF_DESIRE;

  get_chasing(): Entity | undefined {
    return this.chasings.get()?.entity
  }

  get_avoiding(): Entity | undefined {
    return this.avoidings.get()?.entity
  }

  chasings = new NearestTargets(5);
  avoidings = new NearestTargets(5);
  defends = new NearestTargets(5);

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

  /**
   * 判断一个对象是否应该追击某个对象
   *
   * @param {(Entity | null)} [e]
   * @return {*}  {boolean}
   * @memberof BotController
   */
  should_chase(e?: Entity | null): boolean {
    return !!(
      e &&
      this.entity.hp > 0 &&
      e.hp > 0 &&
      e.frame.state !== StateEnum.Lying &&
      !e.invisible &&
      !e.blinking &&
      !e.invulnerable
    )
  }

  should_avoid(e?: Entity | null): boolean {
    return !!(
      e &&
      this.entity.hp > 0 &&
      e.hp > 0 &&
      manhattan_xz(this.entity, e) < 300 && (
        e.frame.state === StateEnum.Lying ||
        e.invisible ||
        e.blinking ||
        e.invulnerable
      )
    )
  }

  should_defend(e?: Entity | null): boolean {
    if (
      this.entity.invisible ||
      this.entity.blinking ||
      this.entity.invulnerable ||
      e?.frame.id === Builtin_FrameId.Gone ||
      !e?.frame.itr?.some(({ kind }) => [
        ItrKind.Normal,
        ItrKind.JohnShield,
        ItrKind.WeaponSwing
      ].some(b => b === kind)
      )
    ) return false

    const dx = this.entity.position.x - e.position.x
    const dz = this.entity.position.z - e.position.z
    if (e.velocity.z < 0 && dz > 40) return false;
    if (e.velocity.z > 0 && dz < -40) return false;
    if (e.velocity.x < 0 && dx > 80) return false;
    if (e.velocity.x > 0 && dx < -80) return false;
    const ret = (
      abs(dx) <= abs(e.velocity.x * 20) + 80 &&
      abs(dz) <= abs(e.velocity.z * 20) + 80
    )
    return ret
  }

  look_other(other: Entity) {
    if (is_character(other)) {
      if (this.entity.is_ally(other)) {

      } else {
        if (this.should_avoid(other)) {
          this.avoidings.look(this.entity, other)
        } else if (this.should_chase(other)) {
          this.chasings.look(this.entity, other)
        }
      }
    } else if (is_ball(other) || is_weapon(other)) {
      if (!this.entity.is_ally(other)) {
        if (this.should_defend(other)) {
          this.defends.look(this.entity, other)
        }
      }
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

  key_up(...ks: LGK[]): this {
    for (const k of ks) {
      if (!this.is_end(k)) {
        this.end(k)
      }
    }
    return this;
  }

  key_down(...ks: LGK[]): this {
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
    const avoiding = this.get_avoiding()
    if (!avoiding) return false;

    const c = this.entity;
    const { x, z } = c.position;
    const { x: enemy_x, z: enemy_z } = avoiding.position;
    const distance = this.manhattan_to(avoiding);
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


    this.chasings.del(({ entity }) => !this.should_chase(entity))
    this.chasings.sort(this.entity)

    this.avoidings.del(({ entity }) => !this.should_avoid(entity))
    this.avoidings.sort(this.entity)

    this.defends.del(({ entity }) => !this.should_defend(entity))
    this.defends.sort(this.entity)

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

  action_desire(): number {
    const crazy_desire = this.desire(); // 默认action设置的desire是crazy的好了。
    // const max_ratio = 1 - (this.lf2.difficulty - 1) / 3
    // const now_desire = max_ratio ?
    //   crazy_desire + this.lf2.random_in(0, 10000 * max_ratio) :
    //   crazy_desire
    return crazy_desire;
  }
  handle_action(action: IBotAction | undefined): LGK[] | false {
    if (!action) return false
    const { facing } = this.entity;
    const { status, e_ray, judger, desire = 10000, keys } = action;
    const action_desire = this.action_desire();
    if (action_desire > desire) return false;
    if (status && !status.some(v => v === this.fsm.state?.key))
      return false;
    if (e_ray) {
      const chasing = this.get_chasing()
      if (!chasing) return false;
      let ray_hit = false
      for (const r of e_ray) {
        ray_hit = is_bot_ray_hit(this.entity, chasing, r);
        if (ray_hit) break;
      }
      if (!ray_hit) return false;
    }

    if (judger && !judger.run(this))
      return false;
    const ks = keys.map<LGK>(v => {
      if (v === 'F') return facing > 0 ? GK.R : GK.L;
      if (v === 'B') return facing > 0 ? GK.R : GK.L;
      return v
    })
    return ks;
  }
}
