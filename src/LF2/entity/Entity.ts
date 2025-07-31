import type { LF2 } from "../LF2";
import type { World } from "../World";
import { Callbacks, ICollision, new_id, new_team, type NoEmitCallbacks } from "../base";
import { BaseController } from "../controller/BaseController";
import { InvalidController } from "../controller/InvalidController";
import {
  BdyKind, Builtin_FrameId, Defines, EntityEnum, FacingFlag, IBaseData, IBounding,
  ICpointInfo, IEntityData, IFrameInfo,
  IItrInfo,
  INextFrame,
  INextFrameResult,
  IOpointInfo, IPos,
  ItrKind,
  IVector3,
  OpointKind, OpointMultiEnum, OpointSpreading, SpeedMode, StateEnum, TFace,
  TNextFrame
} from "../defines";
import Ditto from "../ditto";
import { ENTITY_STATES, States } from "../state";
import BallState_Base from "../state/BallState_Base";
import CharacterState_Base from "../state/CharacterState_Base";
import { State_Base } from "../state/State_Base";
import WeaponState_Base from "../state/WeaponState_Base";
import { cross_bounding } from "../utils/cross_bounding";
import { is_num, is_positive, is_str } from "../utils/type_check";
import { EMPTY_FRAME_INFO } from "./EMPTY_FRAME_INFO";
import { Factory } from "./Factory";
import { GONE_FRAME_INFO } from "./GONE_FRAME_INFO";
import type IEntityCallbacks from "./IEntityCallbacks";
import { bdy_action_handlers } from "./bdy_action_handlers";
import { turn_face } from "./face_helper";
import { itr_action_handlers } from "./itr_action_handlers";
import { IDebugging, make_debugging } from "./make_debugging";
import { is_ball, is_character, is_weapon_data } from "./type_check";
const { max, min, round, abs } = Math
function calc_v(
  old: number,
  speed: number,
  mode: SpeedMode,
  acc: number | undefined,
  direction: 1 | -1 = 1,
): number {
  switch (mode) {
    case SpeedMode.FixedAcc:
      return old + speed;
    case SpeedMode.Acc:
      return old + speed * direction;
    case SpeedMode.FixedLf2:
      return (speed > 0 && old < speed) || (speed < 0 && old > speed)
        ? speed
        : old;
    case SpeedMode.AccTo:
      speed *= direction;
      acc = acc ? acc * direction : void 0;
      if (
        !acc ||
        (speed > 0 && old >= speed) ||
        (speed < 0 && old <= speed) ||
        (speed > old && acc < 0) ||
        (speed < old && acc > 0)
      )
        return old;
      return old + acc;
    case SpeedMode.LF2:
    default:
      speed *= direction;
      return (speed > 0 && old < speed) || (speed < 0 && old > speed)
        ? speed
        : old;
  }
}
export type TData = IBaseData | IEntityData;
export class Entity implements IDebugging {
  static readonly TAG: string = EntityEnum.Entity;
  debug!: (_0: string, ..._1: any[]) => void;
  warn!: (_0: string, ..._1: any[]) => void;
  log!: (_0: string, ..._1: any[]) => void;

  id: string = new_id();
  wait: number = 0;
  update_id: number = Number.MIN_SAFE_INTEGER;
  variant: number = 0;
  reserve?: number = 0;
  data: IEntityData;
  transform_datas?: [IEntityData, IEntityData];
  readonly world: World;
  readonly position = new Ditto.Vector3(0, 0, 0);

  get type() {
    return this.data.type;
  }

  protected _resting_max = Defines.DEFAULT_RESTING_MAX;
  get resting_max(): number {
    return this._resting_max;
  }
  set resting_max(v: number) {
    const o = this._resting_max;
    if (o === v) return;
    this._resting_max = v;
    this._callbacks.emit("on_resting_max_changed")(this, v, o);
  }

  protected _resting = 0;
  get resting() {
    return this._resting;
  }
  set resting(v: number) {
    const o = this._resting;
    if (o === v) return;
    this._resting = v;
    this._callbacks.emit("on_resting_changed")(this, v, o);
  }

  private _fall_value = Defines.DEFAULT_FALL_VALUE_MAX;
  get fall_value(): number {
    return this._fall_value;
  }
  set fall_value(v: number) {
    const o = this._fall_value;
    if (o === v) return;
    this._fall_value = v;
    if (v < o) this.resting = this.resting_max;
    this._callbacks.emit("on_fall_value_changed")(this, v, o);
  }

  private _fall_value_max = Defines.DEFAULT_FALL_VALUE_MAX;
  get fall_value_max(): number {
    return this._fall_value_max;
  }
  set fall_value_max(v: number) {
    const o = this._fall_value_max;
    if (o === v) return;
    this._fall_value_max = v;
    this._callbacks.emit("on_fall_value_max_changed")(this, v, o);
  }

  private _defend_value = Defines.DEFAULT_DEFEND_VALUE_MAX;
  get defend_value(): number {
    return this._defend_value;
  }
  set defend_value(v: number) {
    const o = this._defend_value;
    if (o === v) return;
    this._defend_value = v;
    if (v < o) this.resting = this.resting_max;
    this._callbacks.emit("on_defend_value_changed")(this, v, o);
  }

  private _defend_value_max = Defines.DEFAULT_DEFEND_VALUE_MAX;
  get defend_value_max(): number {
    return this._defend_value_max;
  }
  set defend_value_max(v: number) {
    const o = this._defend_value_max;
    if (o === v) return;
    this._defend_value_max = v;
    this._callbacks.emit("on_defend_value_max_changed")(this, v, o);
  }

  private _healing: number = 0;
  get healing(): number {
    return this._healing;
  }
  set healing(v: number) {
    const o = this._healing;
    if (o === v) return;
    this._healing = v;
    this._callbacks.emit("on_healing_changed")(this, v, o);
  }


  throwinjury?: number;

  get catching() {
    return this._catching;
  }
  get catcher() {
    return this._catcher;
  }
  get lf2(): LF2 {
    return this.world.lf2;
  }

  // private ___facing: TFace = 1;
  // get facing(): TFace { return this.___facing; }
  // set facing(v: TFace) { this.___facing = v; }
  facing: TFace = 1;

  frame: IFrameInfo = EMPTY_FRAME_INFO;

  // next_frame: INextFrame | undefined = void 0;
  private ___next_frame: INextFrame | undefined = void 0;
  get next_frame(): INextFrame | undefined {
    return this.___next_frame;
  }
  set next_frame(v: INextFrame | undefined) {
    this.___next_frame = v;
  }

  protected _prev_frame: IFrameInfo = EMPTY_FRAME_INFO;
  protected _catching?: Entity;
  protected _catcher?: Entity;
  readonly is_entity = true;
  readonly states: States;

  /**
   * 最终速度向量
   * - 每次更新position前，通过velocities计算得出
   * - 直接修改速度向量将不会影响position的计算，
   * - 直接修改会影响到使用其他到velocity判断的逻辑，所以别直接改
   * @readonly
   * @type {IVector3}
   */
  readonly velocity: IVector3 = new Ditto.Vector3(0, 0, 0);

  /**
   * 速度向量数组
   *
   * @readonly
   * @type {IVector3[]}
   */
  readonly velocities: IVector3[] = [new Ditto.Vector3(0, 0, 0)];
  get velocity_0(): IVector3 {
    if (this.velocities.length) return this.velocities[0]!;
    return this.velocities[0] = new Ditto.Vector3(0, 0, 0);
  }

  protected _callbacks = new Callbacks<IEntityCallbacks>();
  protected _name: string = "";
  protected _team: string = new_team();

  protected _mp: number = Defines.DEFAULT_MP;
  protected _mp_max: number = Defines.DEFAULT_MP;
  protected _mp_r_spd_min: number = Defines.DEFAULT_MP_RECOVERY_MIN_SPEED;
  protected _mp_r_spd_max: number = Defines.DEFAULT_MP_RECOVERY_MAX_SPEED;
  protected _mp_r_spd: number = Defines.DEFAULT_MP_RECOVERY_MIN_SPEED;

  protected _hp: number = Defines.DEFAULT_HP;
  protected _hp_r: number = Defines.DEFAULT_HP;
  protected _hp_max: number = Defines.DEFAULT_HP;

  protected _holder?: Entity;
  protected _holding?: Entity;
  protected _emitter?: Entity;
  protected _emitter_opoint?: IOpointInfo;
  protected _a_rest: number = 0;
  public v_rests = new Map<string, ICollision>();

  public motionless: number = 0;
  public shaking: number = 0;

  /**
   * 抓人剩余值
   *
   * 当抓住一个被击晕的人时，此值充满。
   */
  protected _catch_time = Defines.DEFAULT_CATCH_TIME;
  protected _catch_time_max = Defines.DEFAULT_CATCH_TIME;

  /**
   * 隐身计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _invisible_duration: number = 0;

  /**
   * 闪烁计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _blinking_duration: number = 0;

  /**
   * 闪烁完毕后下一动作
   *
   * @protected
   * @type {string | TNextFrame}
   */
  protected _after_blink: string | TNextFrame | null = null;

  protected _picking_sum: number = 0;

  /**
   * 伤害总数
   *
   * @protected
   * @type {number}
   */
  protected _damage_sum: number = 0;

  /**
   * 击杀总数
   *
   * @protected
   * @type {number}
   */
  protected _kill_sum: number = 0;

  get picking_sum() {
    return this._picking_sum;
  }

  get damage_sum() {
    return this._damage_sum;
  }

  get kill_sum() {
    return this._kill_sum;
  }

  get holder(): Entity | undefined {
    return this._holder;
  }

  set holder(v: Entity | undefined) {
    this.set_holder(v);
  }

  get holding(): Entity | undefined {
    return this._holding;
  }

  set holding(v: Entity | undefined) {
    this.set_holding(v);
  }

  get name(): string {
    return this._name;
  }

  set name(v: string) {
    const o = this._name;
    this._callbacks.emit("on_name_changed")(this, (this._name = v), o);
  }

  get mp(): number {
    return this._mp;
  }
  set mp(v: number) {
    const o = this._mp;
    if (o === v) return;
    this._callbacks.emit("on_mp_changed")(this, (this._mp = v), o);
    if (o > 0 && v <= 0) {
      const nf = this.frame.on_exhaustion ?? this.data.on_exhaustion;
      if (nf) this.enter_frame(nf);
    }
  }

  get hp_r(): number {
    return this._hp_r;
  }
  set hp_r(v: number) {
    const o = this._hp_r;
    if (o === v) return;
    this._callbacks.emit("on_hp_r_changed")(this, (this._hp_r = v), o);
  }

  get hp(): number {
    return this._hp;
  }
  set hp(v: number) {
    const o = this._hp;
    if (o === v) return;
    this._callbacks.emit("on_hp_changed")(this, (this._hp = v), o);
    this.update_mp_r_spd();

    if (o > 0 && v <= 0) {
      this._callbacks.emit("on_dead")(this);

      if (this.data.base.brokens?.length) {
        this.apply_opoints(this.data.base.brokens);
        this.play_sound(this.data.base.dead_sounds);
      }
      const nf = this.frame.on_dead ?? this.data.on_dead;
      if (nf) this.enter_frame(nf);
    }

    if (v > this._hp_r) {
      this.hp_r = v
    }
  }

  play_sound(sounds: string[] | undefined, pos: IPos = this.position) {
    if (!sounds?.length) return;
    const sound = this.lf2.random_get(sounds);
    if (!sound) return;
    const { x, y, z } = pos;
    this.lf2.sounds.play(sound, x, y, z);
  }

  get mp_max(): number {
    return this._mp_max;
  }
  set mp_max(v: number) {
    const o = this._mp_max;
    this._callbacks.emit("on_mp_max_changed")(this, (this._mp_max = v), o);
  }

  get hp_max(): number {
    return this._hp_max;
  }
  set hp_max(v: number) {
    const o = this._hp_max;
    this._callbacks.emit("on_hp_max_changed")(this, (this._hp_max = v), o);
    this.update_mp_r_spd();
  }

  get mp_r_spd_min(): number {
    return this._mp_r_spd_min;
  }
  set mp_r_spd_min(v: number) {
    this._mp_r_spd_min = v;
  }
  get mp_r_spd_max(): number {
    return this._mp_r_spd_max;
  }
  set mp_r_spd_max(v: number) {
    this._mp_r_spd_max = v;
  }

  get team(): string {
    return this._team;
  }
  set team(v) {
    const o = this._team;
    this._team = v
    this._callbacks.emit("on_team_changed")(this, v, o);
  }

  get emitter() {
    return this._emitter;
  }
  get a_rest(): number {
    return this._a_rest;
  }

  protected _state: State_Base | undefined;

  set state(v: State_Base | undefined) {
    if (this._state === v) return;
    this._state?.leave?.(this, this.frame);
    this._state = v;
    this._state?.enter?.(this, this.get_prev_frame());
  }

  get state() {
    return this._state;
  }

  /**
   * 闪烁计数
   *
   * @readonly
   * @type {number}
   */
  get blinking() {
    return this._blinking_duration;
  }
  set blinking(v: number) {
    this._blinking_duration = max(0, v);
  }

  /**
   * 隐身计数
   *
   * @readonly
   * @type {number}
   */
  get invisible() {
    return this._invisible_duration;
  }
  set invisible(v: number) {
    this._invisible_duration = max(0, v);
  }

  get callbacks(): NoEmitCallbacks<IEntityCallbacks> {
    return this._callbacks;
  }

  protected _ctrl: BaseController;
  get ctrl(): BaseController {
    return this._ctrl;
  }
  set ctrl(v: BaseController | undefined) {
    if (!v) return;
    if (this._ctrl === v) return;
    this._ctrl?.dispose();
    this._ctrl = v;
  }

  /**
   * 是否属于玩家选择槽的entity
   *
   * @readonly
   * @type {boolean}
   */
  get in_player_slot(): boolean {
    const player_id = this.ctrl?.player_id;
    return !!(player_id && this.world.slot_fighters.has(player_id));
  }

  constructor(world: World, data: IEntityData, states: States = ENTITY_STATES) {
    this.data = data;
    this.world = world;
    this.states = states;
    this._hp_max = data.base.hp ?? Defines.DEFAULT_HP;
    this._ctrl = new InvalidController("", this);

    if (is_weapon_data(data) && data.id === "122") {
      this._mp_max = data.base.mp ?? Defines.DEFAULT_MILK_MP;
    } else if (is_weapon_data(data) && data.id === "123") {
      this._mp_max = data.base.mp ?? Defines.DEFAULT_BEER_MP;
    } else {
      this._mp_max = data.base.mp ?? Defines.DEFAULT_MP;
    }

    if (data.type === EntityEnum.Character) {
      this._mp_r_spd_min =
        data.base.mp_r_min_spd ?? Defines.DEFAULT_MP_RECOVERY_MIN_SPEED;
      this._mp_r_spd_max =
        data.base.mp_r_max_spd ?? Defines.DEFAULT_MP_RECOVERY_MAX_SPEED;
    } else {
      this._mp_r_spd_min = data.base.mp_r_min_spd ?? 0;
      this._mp_r_spd_max = data.base.mp_r_max_spd ?? 0;
    }

    this._catch_time_max = data.base.catch_time ?? Defines.DEFAULT_CATCH_TIME;
    this.update_mp_r_spd();
    this.fall_value_max =
      this.data.base.fall_value ?? Defines.DEFAULT_FALL_VALUE_MAX;
    this.defend_value_max =
      this.data.base.defend_value ?? Defines.DEFAULT_DEFEND_VALUE_MAX;
    this.resting_max =
      this.data.base.resting ?? Defines.DEFAULT_RESTING_MAX;

    this.fall_value = this.fall_value_max;
    this.defend_value = this.defend_value_max;
    this._hp = this._hp_r = this._hp_max;
    this._mp = this._mp_max;
    this._catch_time = this._catch_time_max;
    make_debugging(this)
  }
  set_holder(v: Entity | undefined): this {
    if (this._holder === v) return this;
    const old = this._holder;
    this._holder = v;
    this._callbacks.emit("on_holder_changed")(this, v, old);
    return this;
  }

  set_holding(v: Entity | undefined): this {
    if (this._holding === v) return this;
    const old = this._holding;
    this._holding = v;
    this._callbacks.emit("on_holding_changed")(this, v, old);

    if (v) {
      this._picking_sum += 1;
      this._callbacks.emit("on_picking_sum_changed")(
        this,
        this._picking_sum,
        this._picking_sum - 1,
      );
    }
    return this;
  }

  add_damage_sum(v: number): this {
    const old = this._damage_sum;
    this._damage_sum += v;
    this._callbacks.emit("on_damage_sum_changed")(this, this._damage_sum, old);
    this.emitter?.add_damage_sum(v);
    return this;
  }

  add_kill_sum(v: number): this {
    const old = this._kill_sum;
    this._kill_sum += v;
    this._callbacks.emit("on_kill_sum_changed")(this, this._kill_sum, old);
    this.emitter?.add_kill_sum(v);
    return this;
  }

  get_v_rest(id: string): number {
    const v = this.v_rests.get(id);
    return v?.v_rest ?? 0;
  }

  find_auto_frame(): IFrameInfo {
    return (
      this.state?.get_auto_frame?.(this) ?? this.data.frames["0"] ?? this.frame
    ); // FIXME: fix this 'as'.
  }

  find_emitter(fn: (e: Entity) => boolean): Entity | undefined {
    if (!this.emitter) return void 0;
    if (fn(this.emitter)) return this.emitter;
    return this.emitter.find_emitter(fn);
  }

  on_spawn(
    emitter: Entity,
    opoint: IOpointInfo,
    offset_velocity: IVector3 = new Ditto.Vector3(0, 0, 0),
  ) {
    this._emitter = emitter;
    this._emitter_opoint = opoint;

    const shotter_frame = emitter.frame;
    if (
      emitter.frame.state === StateEnum.Ball_Rebounding ||
      emitter.frame.state === StateEnum.Ball_Flying
    ) {
      this.team = (emitter.lastest_collided?.attacker ?? emitter).team;
      this.facing = emitter.facing;
    } else {
      this.team = emitter.team;
      this.facing = emitter.facing;
    }

    let { x, y, z } = emitter.position;
    y = y + shotter_frame.centery - opoint.y;
    x = x - emitter.facing * (shotter_frame.centerx - opoint.x);
    this.position.set(
      round(x),
      round(y),
      round(z)
    );

    let { dvx = 0, dvy = 0, dvz = 0, speedz = 3 } = opoint;
    let ud = emitter.ctrl?.UD || 0;
    let { x: ovx, y: ovy, z: ovz } = offset_velocity;
    if (dvx > 0) {
      dvx = dvx - abs(ovz / 2);
    } else {
      dvx = dvx + abs(ovz / 2);
    }

    const result = this.get_next_frame(opoint.action);
    const facing = result?.which.facing
      ? this.handle_facing_flag(result.which.facing, result.frame)
      : emitter.facing;
    this.velocity_0.set(
      ovx + dvx * facing,
      ovy + dvy,
      dvz
    )
    this.velocities.push(
      new Ditto.Vector3(0, 0, ovz + speedz * ud),
    );

    if (is_num(opoint.max_hp)) this.hp_max = opoint.max_hp;
    if (is_num(opoint.max_mp)) this.mp_max = opoint.max_mp;
    if (is_num(opoint.hp)) this.hp = opoint.hp;
    if (is_num(opoint.mp)) this.mp = opoint.mp;

    if (result) this.enter_frame(result.which);

    switch (opoint.kind) {
      case OpointKind.Pick:
        this.holder = emitter;
        this.holder.holding = this;
        break;
    }
    return this;
  }

  set_state(next_state_code: number) {
    let next_state = this.states.get(next_state_code);
    if (!next_state) {
      // state not found!
      // debugger; 
      const next_state_key = this.data.type + next_state_code;
      next_state = this.states.get(next_state_key);
      if (!next_state) {
        let State: typeof State_Base;
        switch (this.data.type) {
          case EntityEnum.Character: State = CharacterState_Base; break;
          case EntityEnum.Weapon: State = WeaponState_Base; break;
          case EntityEnum.Ball: State = BallState_Base; break;
          case EntityEnum.Entity: default: State = State_Base; break;
        }
        this.states.set(next_state_key, (next_state = new State()));
      }
    }
    this.state = next_state;
  }

  set_frame(v: IFrameInfo) {
    this._prev_frame = this.frame;
    this.frame = v;
    const prev_state_code = this._prev_frame.state;
    const next_state_code = this.frame.state;
    if (prev_state_code !== next_state_code) {
      this.set_state(next_state_code)
    }
    if (this._prev_frame !== this.frame) {
      this.state?.on_frame_changed?.(this, this.frame, this._prev_frame)
    }
    if (v.invisible) this.invisibility(v.invisible);
    if (v.opoint) this.apply_opoints(v.opoint);
    if (!v.cpoint) delete this._catching;
    const attacking = !!this.frame.itr?.find((v) => {
      return (
        v.kind !== ItrKind.Pick &&
        v.kind !== ItrKind.PickSecretly &&
        v.kind !== ItrKind.Catch &&
        v.kind !== ItrKind.ForceCatch
      );
    });
    if (!attacking) this._a_rest = 0;
  }

  apply_opoints(opoints: IOpointInfo[]) {
    for (const opoint of opoints) {
      let count = 0;
      const multi = opoint.multi ?? 1;
      if (is_num(multi)) {
        count = multi;
      } else if (multi) {
        switch (multi.type) {
          case OpointMultiEnum.AccordingEnemies:
            for (const other of this.world.entities) {
              if (
                is_character(other) &&
                !other.is_ally(this) &&
                other.hp > 0 &&
                this.find_emitter(
                  (emitter) => is_character(emitter) && emitter !== other,
                )
              ) {
                ++count;
              }
            }
            if (count)
              count = max(multi.min, count);
            break;
          case OpointMultiEnum.AccordingAllies:
            for (const other of this.world.entities) {
              if (
                is_character(other) &&
                other.is_ally(this) &&
                other.hp > 0 &&
                this.find_emitter(
                  (emitter) => is_character(emitter) && emitter !== other,
                )
              )
                ++count;
            }
            count = max(multi.min, count);
            break;
        }
      }
      for (let i = 0; i < count; ++i) {
        const v = new Ditto.Vector3(0, 0, 0);
        switch (opoint.spreading) {
          case void 0:
          case OpointSpreading.Normal:
            v.z = (i - (count - 1) / 2) * 2;
            break;
          case OpointSpreading.Bat:
            break;
        }
        this.spawn_entity(opoint, v);
      }
    }
  }

  spawn_entity(
    opoint: IOpointInfo,
    offset_velocity: IVector3 = new Ditto.Vector3(0, 0, 0),
  ): Entity | undefined {
    const oid = this.lf2.random_get(opoint.oid);
    if (!oid) {
      Ditto.Warn(Entity.TAG + "::spawn_object", "oid got", oid);
      return;
    }
    const data = this.world.lf2.datas.find(oid);
    if (!data) {
      Ditto.Warn(
        Entity.TAG + "::spawn_object",
        "data not found! opoint:",
        opoint,
      );
      return;
    }
    const create = Factory.inst.get_entity_creator(data.type);
    if (!create) {
      Ditto.Warn(
        Entity.TAG + "::spawn_object",
        `creator of "${data.type}" not found! opoint:`,
        opoint,
      );
      return;
    }
    const entity = create(this.world, data);
    entity.ctrl = Factory.inst.get_ctrl(entity.data.id, "", entity,) ?? entity.ctrl;
    entity.on_spawn(this, opoint, offset_velocity).attach();

    for (const [k, v] of this.v_rests) {
      /*
      Note: 继承v_rests，避免重复反弹ball...
      */
      entity.v_rests.set(k, v);
    }

    return entity;
  }

  attach(): this {
    this.world.add_entities(this);
    if (EMPTY_FRAME_INFO === this.frame)
      this.enter_frame(Defines.NEXT_FRAME_AUTO);
    return this;
  }

  /**
   * 实体响应地面速度衰减（x轴方向与z轴方向的速度）的衰减
   *
   * 速度衰减逻辑如下，
   * - ```v *= 当前衰减系数*世界摩擦系数```
   * - ```v -= 世界摩擦力（使v向0的方向变化，直至归0）```
   *
   * 以下情况不响应:
   * - 实体处于地面以上(不含地面，即：position.y > 0）
   * - 角色处于shaking中（即实体被某物击中, see IItrInfo.shaking）
   * - 角色处于motionless中，（即实体击中某物时, see IItrInfo.motionless）
   *
   * @see {IItrInfo.shaking} 目标停顿值
   * @see {IItrInfo.motionless} 自身停顿值
   * @see {World.friction_factor} 世界摩擦系数
   * @see {World.friction} 世界摩擦力
   *
   * @param {number} [factor=1] 当前衰减系数
   */
  handle_ground_velocity_decay(factor: number = 1) {
    if (this.position.y > 0 || this.shaking || this.motionless) return;
    let { x, z } = this.velocity_0;
    factor *= this.world.friction_factor;
    x *= factor;
    z *= factor;

    if (x > 0) {
      x -= this.world.friction;
      if (x < 0) x = 0; // 不能因为摩擦力反向加速
    } else if (x < 0) {
      x += this.world.friction;
      if (x > 0) x = 0; // 不能因为摩擦力反向加速
    }

    if (z > 0) {
      z -= this.world.friction;
      if (z < 0) z = 0; // 不能因为摩擦力反向加速
    } else if (z < 0) {
      z += this.world.friction;
      if (z > 0) z = 0; // 不能因为摩擦力反向加速
    }

    this.velocity_0.x = x;
    this.velocity_0.z = z;
  }

  handle_velocity_decay(friction: number) {
    let { x, z } = this.velocity_0;
    if (x > 0) {
      x -= friction;
      if (x < 0) x = 0; // 不能因为摩擦力反向加速
    } else if (x < 0) {
      x += friction;
      if (x > 0) x = 0; // 不能因为摩擦力反向加速
    }

    if (z > 0) {
      z -= friction;
      if (z < 0) z = 0; // 不能因为摩擦力反向加速
    } else if (z < 0) {
      z += friction;
      if (z > 0) z = 0; // 不能因为摩擦力反向加速
    }

    this.velocity_0.x = x;
    this.velocity_0.z = z;
  }

  /**
   * 实体响应重力
   *
   * 本质就是增加y轴方向向下的速度，
   * 有`velocity.y -= State_Base.get_gravity() ?? World.gravity`
   *
   * 以下情况不响应重力:
   *
   * - 实体处于地面或地面以下（position.y <= 0）
   *
   * - 角色处于shaking中（即实体被某物击中, see IItrInfo.shaking）
   *
   * - 角色处于motionless中，（即实体击中某物时, see IItrInfo.motionless）
   *
   * @see {IItrInfo.shaking}
   * @see {IItrInfo.motionless}
   * @see {State_Base.get_gravity}
   * @see {World.gravity}
   */
  handle_gravity() {
    if (this.position.y <= 0 || this.shaking || this.motionless) return;
    this.velocity_0.y -= this.state?.get_gravity(this) ?? this.world.gravity;
  }

  handle_frame_velocity() {
    if (this.shaking || this.motionless) return;
    const {
      acc_x,
      acc_y,
      acc_z,
      dvx,
      dvy,
      dvz,
      vxm = SpeedMode.LF2,
      vym = SpeedMode.Acc,
      vzm = SpeedMode.LF2,
      ctrl_spd_x_m = SpeedMode.LF2,
      ctrl_acc_x,
      ctrl_spd_x,

      ctrl_spd_z_m = SpeedMode.LF2,
      ctrl_acc_z,
      ctrl_spd_z,

      ctrl_spd_y_m = SpeedMode.LF2,
      ctrl_acc_y,
      ctrl_spd_y,
    } = this.frame;
    let { x: vx, y: vy, z: vz } = this.velocity_0;

    if (dvx) vx = calc_v(vx, dvx * this.world.fvx_f, vxm, acc_x, this.facing);
    if (dvy) vy = calc_v(vy, dvy * this.world.fvy_f, vym, acc_y, 1);
    if (dvz) vz = calc_v(vz, dvz * this.world.fvz_f, vzm, acc_z, 1);
    if (this._ctrl) {
      const { UD, LR, jd } = this._ctrl;
      if (LR && ctrl_spd_x && ctrl_spd_x !== 550)
        vx = calc_v(vx, ctrl_spd_x, ctrl_spd_x_m, ctrl_acc_x, LR);
      if (UD && ctrl_spd_z && ctrl_spd_z !== 550)
        vz = calc_v(vz, ctrl_spd_z, ctrl_spd_z_m, ctrl_acc_z, UD);
      if (jd && ctrl_spd_y && ctrl_spd_y !== 550)
        vy = calc_v(vy, ctrl_spd_y, ctrl_spd_y_m, ctrl_acc_y, jd);
    }
    if (dvx === 550) vx = 0;
    if (dvz === 550) vz = 0;
    if (dvy === 550) vy = 0;
    this.velocity_0.x = vx;
    this.velocity_0.y = vy;
    this.velocity_0.z = vz;
  }

  self_update(): void {
    if (this.next_frame) this.enter_frame(this.next_frame);

    if (this._hp > 0) {
      if (this._hp < this._hp_r) {
        let offset = this.world.hp_recovery_spd;
        if (this.healing > 0) {
          this.healing -= this.world.hp_healing_spd
          offset += this.world.hp_healing_spd
        }
        let next_hp = this._hp + offset
        if (next_hp >= this._hp_r) {
          next_hp = this._hp_r
        }
        this.hp = next_hp;
      }

      if (this._mp < this._mp_max)
        this.mp = min(this._mp_max, this._mp + this._mp_r_spd);
    }

    if (this.frame.hp) this.hp -= this.frame.hp;
    const { cpoint } = this.frame;
    if (cpoint) {
      if (cpoint?.decrease) {
        this._catch_time -= abs(cpoint.decrease);
        if (this._catch_time < 0) this._catch_time = 0;
      } else {
        this._catch_time = this._catch_time_max;
      }
    }
    if (this.shaking <= 0) {
      for (const [k, v] of this.v_rests) {
        if (v.v_rest && v.v_rest >= 0) --v.v_rest;
        else this.v_rests.delete(k);
      }
    }
    if (this.motionless <= 0)
      this._a_rest >= 1 ? this._a_rest-- : (this._a_rest = 0);

    if (this._invisible_duration > 0) {
      this._invisible_duration--;
      if (this._invisible_duration <= 0) {
        this._blinking_duration = 120;
      }
    }
    if (this._blinking_duration > 0) {
      this._blinking_duration--;
      if (this._blinking_duration <= 0) {
        if (this._after_blink === Builtin_FrameId.Gone) {
          this.next_frame = void 0;
          this.frame = GONE_FRAME_INFO;
        }
      }
    }

    if (this.holder) {
      this.follow_holder();
      const { wpoint } = this.holder.frame;
      if (wpoint) {
        const { dvx, dvy, dvz } = wpoint;
        if (dvx !== void 0 || dvy !== void 0 || dvz !== void 0) {
          this.enter_frame({ id: this.data.indexes?.throwing });
          const vz = this.holder.ctrl
            ? this.holder.ctrl.UD * (dvz || 0)
            : 0;
          const vx = (dvx || 0 - abs(vz / 2)) * this.facing;
          this.velocity_0.set(vx, dvy || 0, vz);
          this.holder.holding = void 0;
          this.holder = void 0;
        }
      }
      if (this.hp <= 0 && this.holder) {
        this.holder.holding = void 0;
        this.holder = void 0;
      }
    }

    this.state?.pre_update?.(this);
  }

  update_resting() {
    if (this.resting > 0) {
      this.resting--;
      return;
    }
    if (this.fall_value < this.fall_value_max) {
      this.fall_value += 1;
    }
    if (this.defend_value < this.defend_value_max) {
      this.defend_value += 1;
    }
  }

  /**
   * 持有物脱手
   *
   * @return {undefined}
   * @memberof Entity
   */
  drop_holding(): void {
    if (!this.holding) return;
    this.holding.follow_holder();
    this.holding.enter_frame({ id: this.data.indexes?.in_the_sky });
    this.holding.holder = void 0;
    this.holding = void 0;
  }

  update(): void {
    if (this.next_frame) this.enter_frame(this.next_frame);
    if (this.wait > 0) {
      --this.wait;
    } else {
      const nf = this.get_next_frame(this.frame.next);
      if (nf) this.next_frame = { ...nf.which, judger: void 0 }
      else this.next_frame = this.find_auto_frame()
    }
    this.state?.update(this);

    let vx = 0;
    let vy = 0;
    let vz = 0;
    for (const v of this.velocities) {
      vx += v.x;
      vy += v.y;
      vz += v.z;
    }
    for (const [, v] of this.v_rests) {
      if (v.itr.kind === ItrKind.Block) {
        if (
          (vx < 0 && v.attacker.position.x < this.position.x) ||
          (vx > 0 && v.attacker.position.x > this.position.x)
        ) {
          vx = 0;
        }
        if (
          (vz < 0 && v.attacker.position.z < this.position.z) ||
          (vz > 0 && v.attacker.position.z > this.position.z)
        ) {
          vz = 0;
        }
      }
    }
    this.velocity.set(vx, vy, vz);
    if (!this.shaking && !this.motionless) {
      this.position.x = Number((this.position.x + vx).toPrecision(4));
      this.position.y = Number((this.position.y + vy).toPrecision(4));
      this.position.z = Number((this.position.z + vz).toPrecision(4));
    }
    if (this.motionless > 0) {
      ++this.wait;
      --this.motionless;
    } else if (this.shaking > 0) {
      ++this.wait;
      --this.shaking;
    }

    const next_frame_1 = this.update_catching();
    const next_frame_2 = this.update_caught();
    this.next_frame = next_frame_2 || next_frame_1 || this.next_frame;

    if (this.ctrl) {
      const { next_frame, key_list } = this.ctrl.update();
      if (
        key_list === "ja" &&
        this.transform_datas &&
        this.transform_datas[1] === this.data &&
        (this.frame?.state === StateEnum.Walking ||
          this.frame?.state === StateEnum.Standing ||
          this.frame?.state === StateEnum.Defend)
      ) {
        this.transfrom_to_another();
        this.ctrl.reset_key_list();
      } else if (next_frame) {
        const result = this.get_next_frame(next_frame)?.which;
        if (result) this.next_frame = result;
      }
    }
    if (this.frame.on_hit_ground && this.frame.itr && this.velocity.y < 0) {
      for (const itr of this.frame.itr) {
        const { bottom } = this.world.get_bounding(this, this.frame, itr);
        if (bottom > 0) continue;
        const result = this.get_next_frame(this.frame.on_hit_ground);
        if (result) this.enter_frame(result.frame);
        break;
      }
    }
    if (
      this.position.y <= 0 &&
      this.velocity.y < 0 &&
      !this.shaking &&
      !this.motionless
    ) {
      this.position.y = 0;
      this.play_sound(this.data.base.drop_sounds);
      this.velocity_0.y = 0;
      if (this.frame.on_landing) {
        const result = this.get_next_frame(this.frame.on_landing);
        if (result) this.next_frame = result.frame;
      }
      this.state?.on_landing?.(this);
      if (this.throwinjury !== void 0) {
        this.hp -= this.throwinjury;
        this.hp_r -= round(this.throwinjury * (1 - this.world.hp_recoverability))
        delete this.throwinjury;
      }
    }
    if (this.update_id === Number.MAX_SAFE_INTEGER)
      this.update_id = Number.MIN_SAFE_INTEGER;
    else ++this.update_id;
    this.world.restrict(this);
    this.collision_list.length = 0;
    this.collided_list.length = 0;
  }

  /**
   * hp意外归0时，应该去的地方
   * @returns
   */
  get_sudden_death_frame(): TNextFrame {
    return (
      this.state?.get_sudden_death_frame?.(this) || { id: Builtin_FrameId.Auto }
    );
  }

  /**
   * 获取“被抓结束”帧
   *
   * 被抓后，抓人者的“抓取值”降至0时，视为“被抓结束”，
   * 此时被抓者跳去的帧即为“被抓结束”帧
   *
   * @returns 下帧信息
   */
  get_caught_end_frame(): INextFrame {
    return (
      this.state?.get_caught_end_frame?.(this) || { id: Builtin_FrameId.Auto }
    );
  }

  /**
   * 获取“被抓取消”帧
   *
   * 被抓后，抓人者的“抓取值”未降至0，且任意一方的帧缺少cpoint时，视为“被抓取消”，
   * 此时跳去的帧即为“被抓结束”帧
   *
   * @returns 下帧信息
   */
  get_caught_cancel_frame(): INextFrame {
    if (this.position.y < 1) this.position.y = 1;
    return { id: Builtin_FrameId.Auto };
  }

  private prev_cpoint_a?: ICpointInfo;
  update_caught(): INextFrame | undefined {
    if (!this._catcher) return;
    /** "对齐颗粒度" */
    this.follow_catcher();
    if (!this._catcher._catch_time) {
      delete this._catcher;
      this.prev_cpoint_a = void 0;
      return this.get_caught_end_frame();
    }
    const { cpoint: cpoint_a } = this._catcher.frame;
    const { cpoint: cpoint_b } = this.frame;
    if (!cpoint_a || !cpoint_b) {
      delete this._catcher;
      this.prev_cpoint_a = void 0;
      return this.get_caught_cancel_frame();
    }
    if (this.prev_cpoint_a !== cpoint_a) {
      if (cpoint_a.injury) {
        this.hp -= cpoint_a.injury;
        this.hp_r -= round(cpoint_a.injury * (1 - this.world.hp_recoverability))
      }
      if (cpoint_a.shaking && cpoint_a.shaking > 0)
        this.shaking = cpoint_a.shaking;
    }
    this.prev_cpoint_a = cpoint_a;

    const { throwvx, throwvy, throwvz, throwinjury } = cpoint_a;
    if (throwvz) {
      this.velocity_0.z =
        throwvz * this.world.tvz_f * (this._catcher.ctrl?.UD || 0);
    }
    if (throwvx) {
      this.velocity_0.x = throwvx * this.world.tvx_f * this._catcher.facing;
    }
    if (throwvy) {
      this.velocity_0.y = throwvy * this.world.tvy_f;
    }

    if (throwinjury) this.throwinjury = throwinjury;
    if (throwvx || throwvy || throwvz) {
      if (cpoint_a.tx) this.position.x = this.position.x + cpoint_a.tx * this._catcher.facing;
      if (cpoint_a.ty) this.position.y = this.position.y + cpoint_a.ty;
      if (cpoint_a.tz) this.position.z = this.position.z + cpoint_a.tz;
      delete this._catcher;
      this.prev_cpoint_a = void 0;
    }
    if (cpoint_a.vaction) return this.get_next_frame(cpoint_a.vaction)?.which;
  }

  update_catching(): INextFrame | undefined {
    if (!this._catching) return;

    if (!this._catch_time) {
      delete this._catching;
      return this.get_catching_end_frame();
    }

    const { cpoint: cpoint_a } = this.frame;
    const { cpoint: cpoint_b } = this._catching.frame;
    if (!cpoint_a || !cpoint_b) {
      delete this._catching;
      return this.get_catching_cancel_frame();
    }

    const { throwvx, throwvy, throwvz, throwinjury } = cpoint_a;
    if (throwinjury !== void 0) {
      if (throwinjury > 0) {
        // TODO：丢出后，被丢的人落地后的受到的伤害
        // return;
      } else if (throwinjury === -1) {
        // TODO：变成抓住的人
        if (is_character(this) && is_character(this._catching)) {
          this.transform_datas = [this.data, this._catching.data as any];
          (this as Entity).data = this._catching.data;
          return this.find_auto_frame();
        }
      } else {
        return GONE_FRAME_INFO;
      }
    }
    if (throwvx || throwvy || throwvz) {
      delete this._catching;
      return void 0;
    }

    /** "对齐颗粒度" */
    this.follow_catcher();
  }

  follow_catcher() {
    if (!this._catcher) return;
    const {
      centerx: centerx_a,
      centery: centery_a,
      cpoint: c_a,
    } = this._catcher.frame;
    const { centerx: centerx_b, centery: centery_b, cpoint: c_b } = this.frame;
    if (!c_a || !c_b) return;
    if (c_a.throwvx || c_a.throwvx || c_a.throwvx) return;
    const face_a = this._catcher.facing;
    const face_b = this.facing;
    const { x: px, y: py, z: pz } = this._catcher.position;
    this.position.x =
      px - face_a * (centerx_a - c_a.x) + face_b * (centerx_b - c_b.x);
    this.position.y = round(py + centery_a - c_a.y + c_b.y - centery_b);
    this.position.z = round(pz);
    if (c_b.cover === 11 || c_b.cover === 1) this.position.z -= 0.5;
    else if (c_b.cover === 10 || c_b.cover === 0) this.position.z += 0.5;
  }

  /**
   * 获取“抓人结束”帧
   *
   * 抓人后，“抓取值”降至0时，视为“抓人结束”，
   *
   * 此时跳去的帧即为“抓人结束”帧
   *
   * @returns 下帧信息
   */
  get_catching_end_frame(): INextFrame {
    return { id: Builtin_FrameId.Auto };
  }

  /**
   * 获取“抓人取消”帧
   *
   * 抓人后，“抓取值”未降至0，且任意一方的帧缺少cpoint时，视为“抓人取消”，
   *
   * 此时跳去的帧即为“抓人取消”帧
   *
   * @returns 下帧信息
   */
  get_catching_cancel_frame(): INextFrame {
    return { id: Builtin_FrameId.Auto };
  }

  transfrom_to_another() {
    const { transform_datas } = this;
    if (!transform_datas) return;
    const next_idx = (transform_datas.indexOf(this.data) + 1) % transform_datas.length;
    this.data = transform_datas[next_idx]!;
    this.next_frame = this.get_next_frame({ id: "245" })?.frame;
  }

  /**
   * 最近一次攻击信息
   *
   * @type {ICollision}
   * @memberof Entity
   */
  lastest_collision?: ICollision;

  /**
   * 最近一次被攻击信息
   *
   * @type {ICollision}
   * @memberof Entity
   */
  lastest_collided?: ICollision;

  /**
   * 当前tick碰撞信息
   *
   * - 会在update后置空
   *
   * @type {ICollision[]}
   * @memberof Entity
   */
  readonly collision_list: ICollision[] = [];

  /**
   * 当前tick被碰撞信息
   *
   * - 会在update后置空
   *
   * @type {ICollision[]}
   * @memberof Entity
   */
  readonly collided_list: ICollision[] = [];
  start_catch(target: Entity, itr: IItrInfo) {
    this.debug(`start_catch`)
    if (itr.catchingact === void 0) {
      this.warn(`start_catch`, `cannot catch, catchingact got ${itr.catchingact}`);
      return;
    }
    this._catch_time = this._catch_time_max;
    this._catching = target;
    this.next_frame = this.get_next_frame(itr.catchingact)?.which;
  }

  start_caught(attacker: Entity, itr: IItrInfo) {
    this.debug(`start_caught`)
    if (itr.caughtact === void 0) {
      this.warn(`start_caught`, `cannot be caught, caughtact got ${itr.caughtact}`)
      return;
    }
    this._catcher = attacker;
    this.resting = 0;
    this.fall_value = this.fall_value_max;
    this.defend_value = this.defend_value_max;
    this.next_frame = this.get_next_frame(itr.caughtact)?.which;
  }

  on_collision(collision: ICollision): void {
    this.collision_list.push((this.lastest_collision = collision));
    const { itr } = collision;

    if (is_ball(collision.victim)) {
      this.shaking = itr.motionless ?? collision.victim.world.itr_motionless;
    } else {
      this.motionless = itr.motionless ?? collision.victim.world.itr_motionless;
    }

    if (itr.arest) {
      this._a_rest = itr.arest + this.world.arest_offset;
    } else if (!itr.vrest) {
      this._a_rest =
        this.wait + this.motionless + 2 + this.world.arest_offset_2;
    }

    if (itr.actions?.length) {
      for (const action of itr.actions) {
        if (action.tester?.run(collision) === false)
          continue;
        itr_action_handlers[action.type](action, collision)
      }
    }
  }

  spark_point(r0: IBounding, r1: IBounding) {
    const {
      left: l,
      right: r,
      top: t,
      bottom: b,
      near: n,
      far: f,
    }: IBounding = cross_bounding(r0, r1);
    const x = this.lf2.random_in(l, r);
    const y = this.lf2.random_in(b, t);
    const z = this.lf2.random_in(f, n);
    return [x, y, z] as const;
  }

  dizzy_catch_test(target: Entity): boolean {
    return (
      is_character(this) &&
      is_character(target) && target.frame.state === StateEnum.Tired &&
      ((this.velocity_0.x > 0 && target.position.x > this.position.x) ||
        (this.velocity_0.x < 0 && target.position.x < this.position.x))
    );
  }


  on_be_collided(collision: ICollision): void {
    this.collided_list.push((this.lastest_collided = collision));
    const { itr, bdy } = collision;
    this.shaking = itr.shaking ?? collision.attacker.world.itr_shaking;
    if (collision.v_rest !== void 0) {
      this.v_rests.set(collision.attacker.id, collision);
    }
    if (bdy.kind >= BdyKind.GotoMin && bdy.kind <= BdyKind.GotoMax) {
      const result = this.get_next_frame({ id: "" + (bdy.kind - 1000) });
      if (result) this.next_frame = result.frame;
      return;
    }
    if (bdy.actions?.length) {
      for (const action of bdy.actions) {
        if (action.tester && !action.tester?.run(collision))
          continue;
        bdy_action_handlers[action.type](action, collision)
      }
    }
    if (
      itr.kind !== ItrKind.Block &&
      itr.kind !== ItrKind.Whirlwind &&
      itr.kind !== ItrKind.MagicFlute &&
      itr.kind !== ItrKind.MagicFlute2
    ) {
      const sounds = this.data.base.hit_sounds;
      this.play_sound(sounds);
    }
  }

  dispose(): void {
    this.world.del_entity(this);
    this.ctrl.dispose();
    this._callbacks.emit("on_disposed")(this);
    this._callbacks.clear()
  }

  /**
   * 开始闪烁,闪烁完成后移除自己
   *
   * @param {number} duration 闪烁持续帧数
   */
  blink_and_gone(duration: number) {
    this._blinking_duration = duration;
    this._after_blink = Builtin_FrameId.Gone;
  }

  /**
   * 开始隐身
   *
   * @param {number} duration 隐身持续帧数
   */
  invisibility(duration: number) {
    this._invisible_duration = duration;
  }

  protected update_mp_r_spd(): void {
    this._mp_r_spd =
      this._mp_r_spd_min +
      ((this._mp_r_spd_max - this._mp_r_spd_min) * (this._hp_max - this._hp)) /
      this._hp_max;
  }

  is_ally(other: Entity): boolean {
    return this.team === other.team;
  }

  follow_holder() {
    const holder = this.holder;
    if (!holder) return;
    const {
      wpoint: wpoint_a,
      centerx: centerx_a,
      centery: centery_a,
    } = holder.frame;
    if (!wpoint_a) this.debug(`follow_holder`, `failed! holder.frame.wpoint got ${wpoint_a}`)
    if (!wpoint_a) return;

    if (wpoint_a.weaponact !== this.frame.id) {
      this.enter_frame({ id: wpoint_a.weaponact });
    }
    const {
      wpoint: wpoint_b,
      centerx: centerx_b,
      centery: centery_b,
    } = this.frame;
    if (!wpoint_b) this.debug(`follow_holder`, `failed! this.frame.wpoint got ${wpoint_b}`)
    if (!wpoint_b) return;

    const { x, y, z } = holder.position;
    this.facing = holder.facing;

    this.position.set(
      round(x + this.facing * (wpoint_a.x - centerx_a + centerx_b - wpoint_b.x)),
      round(y + centery_a - wpoint_a.y - centery_b + wpoint_b.y),
      round(z - wpoint_a.cover / 2),
    );
  }

  protected _chasing_target?: Entity;
  get chasing_target(): Entity | undefined { return this._chasing_target; }
  set chasing_target(e: Entity | undefined) { this._chasing_target = e; }



  enter_frame(which: TNextFrame): void {
    if (this.frame.id === Builtin_FrameId.Gone) {
      return;
    }
    const result = this.get_next_frame(which);
    if (!result) {
      this.next_frame = void 0;
      return;
    }
    const { frame, which: flags } = result;
    if (!this.world.lf2.infinity_mp) {
      const { mp, hp } = flags;
      if (mp) this.mp -= mp;
      if (hp) this.hp -= hp;
    }
    if (frame.sound) {
      const { x, y, z } = this.position;
      this.world.lf2.sounds.play(frame.sound, x, y, z);
    }
    this.set_frame(frame);

    this.next_frame = void 0;
    if (flags.facing !== void 0) {
      this.facing = this.handle_facing_flag(flags.facing, frame);
    }
    if (flags.wait !== void 0) {
      this.wait = this.handle_wait_flag(flags.wait, frame);
    } else {
      this.wait = frame.wait + this.world.frame_wait_offset;
    }
    if (flags.sounds?.length) this.play_sound(flags.sounds);

    if (flags.blink_time) this.blinking = flags.blink_time;
  }

  handle_wait_flag(wait: string | number, frame: IFrameInfo): number {
    if (wait === "i") return this.wait;
    if (wait === "d")
      return max(0, frame.wait - this.frame.wait + this.wait);
    if (is_positive(wait)) return wait;
    return frame.wait + this.world.frame_wait_offset;
  }

  /**
   * 进入下一帧时，需要处理朝向
   *
   * @see {FacingFlag}
   * @param facing 目标朝向, 可参考FacingFlag
   * @param frame 帧
   * @returns 返回新的朝向
   */
  handle_facing_flag(facing: number, frame: IFrameInfo): -1 | 1 {
    switch (facing) {
      case FacingFlag.Ctrl:
        return this.ctrl?.LR || this.facing;
      case FacingFlag.AntiCtrl:
        return this.ctrl?.LR
          ? turn_face(this.ctrl.LR)
          : this.facing;
      case FacingFlag.SameAsCatcher:
        return this._catcher?.facing || this.facing;
      case FacingFlag.OpposingCatcher:
        return turn_face(this._catcher?.facing) || this.facing;
      case FacingFlag.Backward:
        return turn_face(this.facing);
      case FacingFlag.Left:
      case FacingFlag.Right:
        return facing;
      default:
        return this.facing;
    }
  }

  get_next_frame(which: TNextFrame): INextFrameResult | undefined {
    if (Array.isArray(which)) {
      const l = which.length;
      for (let i = 0; i < l; ++i) {
        const nf: INextFrame | undefined = which[i];
        if (!nf) continue;
        const f = this.get_next_frame(nf);
        if (f) return f;
      }
      return void 0;
    }
    const id = which.id;
    const judger = which.judger;
    const use_hp = which.hp;
    const use_mp = which.mp;

    if (judger && !judger.run(this)) {
      return void 0;
    }
    let frame: IFrameInfo | undefined;
    if (id) {
      frame = this.find_frame_by_id(this.lf2.random_get(id));
      if (!frame) return void 0;
    } else {
      frame = this.frame;
    }

    if (!this.world.lf2.infinity_mp) {
      if (this.frame.next === which) {
        // 用next 进入此动作，负数表示消耗，无视正数。若消耗完毕跳至按下防御键的指定跳转动作
        if (use_mp && this._mp < use_mp)
          return this.get_next_frame(frame.hit?.d ?? Defines.NEXT_FRAME_AUTO);
        if (use_hp && this._hp < use_hp)
          return this.get_next_frame(frame.hit?.d ?? Defines.NEXT_FRAME_AUTO);
      } else {
        if (use_mp && this._mp < use_mp) return void 0;
        if (use_hp && this._hp < use_hp) return void 0;
      }
    }

    let w: INextFrame;
    if (is_str(which)) {
      w = { id: which };
    } else {
      w = which;
    }

    return { frame, which: w };
  }

  find_frame_by_id(id: string | undefined): IFrameInfo | undefined {
    const r = this.state?.find_frame_by_id?.(this, id);
    if (r) return r;

    switch (id) {
      case void 0:
      case Builtin_FrameId.None:
      case Builtin_FrameId.Self:
        return this.frame;
      case Builtin_FrameId.Auto:
        return this.find_auto_frame();
      case Builtin_FrameId.Gone:
        return GONE_FRAME_INFO;
    }
    if (!this.data.frames[id]) {
      console.warn(
        Entity.TAG + "::find_frame_by_id",
        "frame not find! id:",
        id,
      );
      debugger;
      return EMPTY_FRAME_INFO;
    }
    return this.data.frames[id];
  }

  get_prev_frame() {
    return this._prev_frame;
  }

  merge_velocities() {
    if (this.velocities.length <= 1) return;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    for (const v of this.velocities) {
      vx += v.x;
      vy += v.y;
      vz += v.z;
    }
    this.velocities.length = 1;
    this.velocity_0.set(vx, vy, vz);
  }
}

Factory.inst.set_entity_creator(
  EntityEnum.Ball,
  (...args) => new Entity(...args),
);
Factory.inst.set_entity_creator(
  EntityEnum.Weapon,
  (...args) => new Entity(...args),
);
Factory.inst.set_entity_creator(
  EntityEnum.Entity,
  (...args) => new Entity(...args),
);
Factory.inst.set_entity_creator(
  EntityEnum.Character,
  (...args) => new Entity(...args),
);