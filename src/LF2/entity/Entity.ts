
import { Warn } from '../../Log';
import LF2 from '../LF2';
import type { World } from '../World';
import { ICube } from '../World';
import { Callbacks, new_id, new_team, type NoEmitCallbacks } from '../base';
import { IExpression } from '../base/Expression';
import { BaseController } from '../controller/BaseController';
import { IBaseData, IBdyInfo, ICpointInfo, IEntityData, IFrameInfo, IItrInfo, INextFrameResult, IOpointInfo, ITexturePieceInfo, TFace, TNextFrame } from '../defines';
import { OpointKind } from '../defines/OpointKind';
import { SpeedMode } from '../defines/SpeedMode';
import { Defines } from '../defines/defines';
import Ditto from '../ditto';
import { IVector3 } from '../ditto/IVector3';
import { ENTITY_STATES, States } from '../state';
import BallState_Base from '../state/BallState_Base';
import CharacterState_Base from '../state/CharacterState_Base';
import { State_Base } from '../state/State_Base';
import WeaponState_Base from '../state/WeaponState_Base';
import { random_get } from '../utils/math/random';
import { is_positive, is_str } from '../utils/type_check';
import { Factory } from './Factory';
import type IEntityCallbacks from './IEntityCallbacks';
import { turn_face } from './face_helper';
import { is_character, is_weapon_data } from './type_check';
const calc_v = (a: number, b: number, c: number) => {
  if (c === 1) return a + b
  return (b > 0 && a < b) || (b < 0 && a > b) ? b : a
}
export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: '', x: 0, y: 0, w: 0, h: 0,
  pixel_h: 0, pixel_w: 0,
}
export const EMPTY_FRAME_INFO: IFrameInfo = {
  id: Defines.FrameId.None,
  name: '',
  pic: { tex: '', x: 0, y: 0, w: 0, h: 0 },
  state: NaN,
  wait: 0,
  next: { id: Defines.FrameId.Auto },
  centerx: 0,
  centery: 0
};
export const GONE_FRAME_INFO: IFrameInfo = {
  id: Defines.FrameId.Gone,
  name: 'GONE_FRAME_INFO',
  pic: { tex: '', x: 0, y: 0, w: 0, h: 0 },
  state: NaN,
  wait: 0,
  next: { id: Defines.FrameId.Gone },
  centerx: 0,
  centery: 0
};
export type TData = IBaseData | IEntityData | IEntityData | IEntityData | IEntityData
export interface CollisionInfo {
  victim: Entity
  attacker: Entity,
  itr: IItrInfo,
  bdy: IBdyInfo,
  aframe: IFrameInfo,
  bframe: IFrameInfo,
  a_cube: ICube,
  b_cube: ICube
}
export interface IVictimRest {
  remain: number,
  itr: IItrInfo,
  bdy: IBdyInfo,
  attacker: Entity,
  a_cube: ICube,
  b_cube: ICube,
  a_frame: IFrameInfo,
  b_frame: IFrameInfo
}

export default class Entity {
  static readonly TAG: string = 'Entity';

  id: string = new_id();
  wait: number = 0;
  update_id: number = Number.MIN_SAFE_INTEGER;
  variant: number = 0;
  reserve?: number = 0;
  data: IEntityData;
  transform_datas?: [IEntityData, IEntityData];
  readonly world: World;
  readonly position = new Ditto.Vector3(0, 0, 0);
  protected _resting = 0;
  get resting() { return this._resting; }
  set resting(v: number) {
    const o = this._resting
    if (o === v) return;
    this._resting = v;
    this._callbacks.emit('on_resting_changed')(this, v, o)
  }

  private _fall_value = Defines.DEFAULT_FALL_VALUE_MAX;
  get fall_value(): number { return this._fall_value; }
  set fall_value(v: number) {
    const o = this._fall_value
    if (o === v) return;
    this._fall_value = v;
    if (v < o) this.resting = 30;
    this._callbacks.emit('on_fall_value_changed')(this, v, o)
  }

  private _fall_value_max = Defines.DEFAULT_FALL_VALUE_MAX;
  get fall_value_max(): number { return this._fall_value_max; }
  set fall_value_max(v: number) {
    const o = this._fall_value_max;
    if (o === v) return;
    this._fall_value_max = v;
    this._callbacks.emit('on_fall_value_max_changed')(this, v, o)
  }


  private _defend_value = Defines.DEFAULT_DEFEND_VALUE_MAX;
  get defend_value(): number { return this._defend_value; }
  set defend_value(v: number) {
    const o = this._defend_value;
    if (o === v) return;
    this._defend_value = v;
    if (v < o) this.resting = 30;
    this._callbacks.emit('on_defend_value_changed')(this, v, o)
  }

  private _defend_value_max = Defines.DEFAULT_DEFEND_VALUE_MAX;
  get defend_value_max(): number { return this._defend_value_max; }
  set defend_value_max(v: number) {
    const o = this._defend_value_max;
    if (o === v) return;
    this._defend_value_max = v;
    this._callbacks.emit('on_defend_value_max_changed')(this, v, o)
  }

  throwinjury?: number;

  get catching() { return this._catching; }
  get catcher() { return this._catcher; }
  get lf2(): LF2 { return this.world.lf2 }

  // private ___facing: TFace = 1;
  // get facing(): TFace { return this.___facing; }
  // set facing(v: TFace) { this.___facing = v; }
  facing: TFace = 1;

  frame: IFrameInfo = EMPTY_FRAME_INFO;

  next_frame: TNextFrame | undefined = void 0;
  protected _prev_frame: IFrameInfo = EMPTY_FRAME_INFO;
  protected _catching?: Entity;
  protected _catcher?: Entity;
  readonly is_entity = true
  readonly states: States;

  /**
   * 最终速度向量
   * - 每次更新position前，通过velocities计算得出
   * - 直接修改速度向量将不会影响position的计算，
   * - 直接修改会影响到使用其他到velocity判断的逻辑，所以别直接改
   * @readonly
   * @type {IVector3}
   */
  readonly velocity: IVector3 = new Ditto.Vector3(0, 0, 0)

  /**
   * 速度向量数组
   *
   * @readonly
   * @type {IVector3[]}
   */
  readonly velocities: IVector3[] = [new Ditto.Vector3(0, 0, 0)];

  protected _callbacks = new Callbacks<IEntityCallbacks>()
  protected _name: string = '';
  protected _team: string = new_team();

  protected _mp: number = Defines.DEFAULT_MP;
  protected _mp_max: number = Defines.DEFAULT_MP;
  protected _mp_r_spd_min: number = Defines.DEFAULT_MP_RECOVERY_MIN_SPEED;
  protected _mp_r_spd_max: number = Defines.DEFAULT_MP_RECOVERY_MAX_SPEED;
  protected _mp_r_spd: number = Defines.DEFAULT_MP_RECOVERY_MIN_SPEED;

  protected _hp: number = Defines.DAFUALT_HP;
  protected _hp_max: number = Defines.DAFUALT_HP;

  protected _holder?: Entity;
  protected _holding?: Entity;
  protected _emitter?: Entity;
  protected _emitter_opoint?: IOpointInfo;
  protected _a_rest: number = 0;
  public v_rests = new Map<string, IVictimRest>();

  public motionless: number = 0
  public shaking: number = 0;

  /** 
   * 抓人剩余值
   * 
   * 当抓住一个被击晕的人时，此值充满。
   */
  protected _catch_time = Defines.DAFUALT_CATCH_TIME;
  protected _catch_time_max = Defines.DAFUALT_CATCH_TIME

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

  get picking_sum() { return this._picking_sum; }

  get damage_sum() { return this._damage_sum; }

  get kill_sum() { return this._kill_sum; }

  get holder(): Entity | undefined { return this._holder }

  set holder(v: Entity | undefined) { this.set_holder(v) }

  get holding(): Entity | undefined { return this._holding }

  set holding(v: Entity | undefined) { this.set_holding(v) }

  get name(): string { return this._name; }

  set name(v: string) {
    const o = this._name;
    this._callbacks.emit('on_name_changed')(this, this._name = v, o)
  }

  get mp(): number { return this._mp; }
  set mp(v: number) {
    const o = this._mp;
    this._callbacks.emit('on_mp_changed')(this, this._mp = v, o)

    if (o > 0 && v <= 0) {
      const nf = this.frame.on_exhaustion ?? this.data.on_exhaustion;
      if (nf) this.enter_frame(nf);
    }
  }

  get hp(): number { return this._hp; }
  set hp(v: number) {
    const o = this._hp;
    this._callbacks.emit('on_hp_changed')(this, this._hp = v, o)
    this.update_mp_r_spd();

    if (o > 0 && v <= 0) {
      this._callbacks.emit('on_dead')(this);

      if (this.data.base.brokens?.length) {
        this.apply_opoints(this.data.base.brokens);
        this.play_sound(this.data.base.dead_sounds);
      }
      const nf = this.frame.on_dead ?? this.data.on_dead;
      if (nf) this.enter_frame(nf);
    }
  }

  play_sound(sounds: string[] | undefined) {
    if (!sounds?.length) return;
    const sound = random_get(sounds)
    if (!sound) return;
    const { x, y, z } = this.position;
    this.lf2.sounds.play(sound, x, y, z)
  }

  get mp_max(): number { return this._mp_max; }
  set mp_max(v: number) {
    const o = this._mp_max;
    this._callbacks.emit('on_mp_max_changed')(this, this._mp_max = v, o)
  }

  get hp_max(): number { return this._hp_max; }
  set hp_max(v: number) {
    const o = this._hp_max;
    this._callbacks.emit('on_hp_max_changed')(this, this._hp_max = v, o)
    this.update_mp_r_spd();
  }

  get mp_r_spd_min(): number { return this._mp_r_spd_min; }
  set mp_r_spd_min(v: number) { this._mp_r_spd_min = v; }
  get mp_r_spd_max(): number { return this._mp_r_spd_max; }
  set mp_r_spd_max(v: number) { this._mp_r_spd_max = v; }

  get team(): string { return this._team || this.starter?.team || '' }
  set team(v) {
    const o = this._team;
    this._callbacks.emit('on_team_changed')(this, this._team = v, o)
  }

  get emitter() { return this._emitter }
  get starter() {
    if (!this._emitter) return null;
    let e = this._emitter;
    while (e._emitter) e = e._emitter;
    return e;
  }
  get a_rest(): number { return this._a_rest }


  protected _state: State_Base | undefined;


  set state(v: State_Base | undefined) {
    if (this._state === v) return;
    this._state?.leave?.(this, this.frame)
    this._state = v;
    this._state?.enter?.(this, this.get_prev_frame())
  }

  get state() { return this._state; }

  /**
   * 闪烁计数F
   *
   * @readonly
   * @type {number}
   */
  get blinking() { return this._blinking_duration }
  set blinking(v: number) { this._blinking_duration = Math.max(0, v) }


  /**
   * 隐身计数
   *
   * @readonly
   * @type {number}
   */
  get invisible() { return this._invisible_duration }
  set invisible(v: number) { this._invisible_duration = Math.max(0, v) }


  get callbacks(): NoEmitCallbacks<IEntityCallbacks> {
    return this._callbacks
  }

  protected _controller?: BaseController;
  get controller() { return this._controller; }
  set controller(v) {
    if (this._controller === v) return;
    this._controller?.dispose();
    this._controller = v;
  }

  /**
   * 是否属于玩家选择槽的entity
   *
   * @readonly
   * @type {boolean}
   */
  get in_player_slot(): boolean {
    const player_id = this.controller?.player_id
    return !!(player_id && this.world.player_slot_characters.has(player_id))
  }

  constructor(world: World, data: IEntityData, states: States = ENTITY_STATES) {
    this.data = data;
    this.world = world;
    this.states = states;
    this._hp_max = data.base.hp ?? Defines.DAFUALT_HP;

    if (is_weapon_data(data) && data.id === '122') {
      this._mp_max = data.base.mp ?? Defines.DEFAULT_MILK_MP;
    } else if (is_weapon_data(data) && data.id === '123') {
      this._mp_max = data.base.mp ?? Defines.DEFAULT_BEER_MP;
    } else {
      this._mp_max = data.base.mp ?? Defines.DEFAULT_MP;
    }

    if (data.type === 'character') {
      this._mp_r_spd_min = data.base.mp_r_min_spd ?? Defines.DEFAULT_MP_RECOVERY_MIN_SPEED;
      this._mp_r_spd_max = data.base.mp_r_max_spd ?? Defines.DEFAULT_MP_RECOVERY_MAX_SPEED;
    } else {
      this._mp_r_spd_min = data.base.mp_r_min_spd ?? 0;
      this._mp_r_spd_max = data.base.mp_r_max_spd ?? 0;
    }

    this._catch_time_max = data.base.catch_time ?? Defines.DAFUALT_CATCH_TIME;
    this.update_mp_r_spd();
    this.fall_value_max = this.data.base.fall_value ?? Defines.DEFAULT_FALL_VALUE_MAX;
    this.defend_value_max = this.data.base.defend_value ?? Defines.DEFAULT_DEFEND_VALUE_MAX;
    this.fall_value = this.fall_value_max
    this.defend_value = this.defend_value_max
    this._hp = this._hp_max
    this._mp = this._mp_max
    this._catch_time = this._catch_time_max;
  }

  set_holder(v: Entity | undefined): this {
    if (this._holder === v) return this;
    const old = this._holder
    this._holder = v;
    this._callbacks.emit("on_holder_changed")(this, v, old)
    return this;
  }

  set_holding(v: Entity | undefined): this {
    if (this._holding === v) return this;
    const old = this._holding;
    this._holding = v;
    this._callbacks.emit("on_holding_changed")(this, v, old)

    if (v) {
      this._picking_sum += 1;
      this._callbacks.emit("on_picking_sum_changed")(this, this._picking_sum, this._picking_sum - 1)
    }
    return this;
  }

  add_damage_sum(v: number): this {
    const old = this._damage_sum
    this._damage_sum += v;
    this._callbacks.emit("on_damage_sum_changed")(this, this._damage_sum, old)
    this.emitter?.add_damage_sum(v);
    return this
  }

  add_kill_sum(v: number): this {
    const old = this._kill_sum
    this._kill_sum += v;
    this._callbacks.emit("on_kill_sum_changed")(this, this._kill_sum, old)
    this.emitter?.add_kill_sum(v);
    return this
  }

  get_v_rest_remain(id: string): number {
    const v = this.v_rests.get(id);
    return v ? v.remain : 0
  }

  find_v_rest(fn: (k: string, v: IVictimRest) => any): IVictimRest | undefined {
    for (const [k, v] of this.v_rests) if (fn(k, v)) return v;
    return void 0;
  }

  find_auto_frame(): IFrameInfo {
    return (
      this.state?.get_auto_frame?.(this) ??
      this.data.frames['0'] ??
      this.frame
    )  // FIXME: fix this 'as'.
  }

  on_spawn(
    emitter: Entity,
    opoint: IOpointInfo,
    offset_velocity: IVector3 = new Ditto.Vector3(0, 0, 0)
  ) {
    this._emitter = emitter;
    this._emitter_opoint = opoint;

    this.velocities[1] = offset_velocity;

    const shotter_frame = emitter.frame;

    if (emitter.frame.state === Defines.State.Ball_Rebounding) {
      if (!emitter.lastest_collided) debugger
      this.team = emitter.lastest_collided?.attacker.team || new_team();
      this.facing = emitter.facing;
    } else {
      this.team = emitter.team;
      this.facing = emitter.facing;
    }

    let { x, y, z } = emitter.position;
    y = y + shotter_frame.centery - opoint.y;
    x = x - emitter.facing * (shotter_frame.centerx - opoint.x);
    this.position.set(x, y, z);

    let { dvx = 0, dvy = 0, dvz = 0, speedz = 3 } = opoint;
    let ud = emitter.controller?.UD || 0
    let { x: ovx, y: ovy, z: ovz } = offset_velocity;
    if (dvx > 0) {
      dvx = dvx - Math.abs(ovz / 2);
    } else {
      dvx = dvx + Math.abs(ovz / 2);
    }

    const result = this.get_next_frame(opoint.action)
    const facing = result?.which.facing ? this.handle_facing_flag(result.which.facing, result.frame) : emitter.facing;
    this.velocities[0].x = ovx + dvx * facing;
    this.velocities.push(
      new Ditto.Vector3(
        offset_velocity.x,
        offset_velocity.y + ovy + dvy,
        offset_velocity.z + ovz + dvz + speedz * ud
      )
    )

    if (opoint.max_hp) this.hp_max = opoint.max_hp;
    if (opoint.max_mp) this.mp_max = opoint.max_mp;
    if (opoint.hp) this.hp = opoint.hp;
    if (opoint.mp) this.mp = opoint.mp;

    this.enter_frame(result?.which);

    switch (opoint.kind) {
      case OpointKind.Pick:
        this.holder = emitter
        this.holder.holding = this
        break;
    }
    return this;
  }

  set_frame(v: IFrameInfo) {
    this._prev_frame = this.frame;
    this.frame = v;
    const prev_state_code = this._prev_frame.state;
    const next_state_code = this.frame.state;

    if (prev_state_code !== next_state_code) {
      let next_state = this.states.get(next_state_code)
      if (!next_state) {
        debugger;
        const next_state_key = this.data.type + next_state_code
        next_state = this.states.get(next_state_key)
        if (!next_state) {
          switch (this.data.type) {
            case 'character':
              this.states.set(next_state_key, next_state = new CharacterState_Base());
              break;
            case 'weapon':
              this.states.set(next_state_key, next_state = new WeaponState_Base());
              break;
            case 'ball':
              this.states.set(next_state_key, next_state = new BallState_Base());
              break;
            case 'entity':
            default:
              this.states.set(next_state_key, next_state = new State_Base());
              break;
          }
        }
      }
      this.state = next_state;
    }
    if (v.invisible)
      this.invisibility(v.invisible)
    if (v.opoint) {
      this.apply_opoints(v.opoint)
    }
    if (!v.cpoint)
      delete this._catching;
  }

  apply_opoints(opoints: IOpointInfo[]) {
    for (const opoint of opoints) {
      const count = opoint.multi ?? 1
      for (let i = 0; i < count; ++i) {
        const v = new Ditto.Vector3(0, 0, 0);
        switch (opoint.spreading) {
          case void 0:
          case Defines.OpointSpreading.Normal:
            v.z = i - (count - 1) / 2;
            break;
          case Defines.OpointSpreading.Bat:
        }
        this.spawn_entity(opoint, v)
      }
    }
  }

  spawn_entity(opoint: IOpointInfo, offset_velocity: IVector3 = new Ditto.Vector3(0, 0, 0)): Entity | undefined {
    const data = this.world.lf2.datas.find(opoint.oid);
    if (!data) {
      Warn.print(Entity.TAG + '::spawn_object', 'data not found! opoint:', opoint);
      return;
    }
    const create = Factory.inst.get_entity_creator(data.type);
    if (!create) {
      Warn.print(Entity.TAG + '::spawn_object', `creator of "${data.type}" not found! opoint:`, opoint);
      return;
    }
    const entity = create(this.world, data)
    entity.controller = Factory.inst.get_ctrl_creator(entity.data.id)?.('', entity);
    entity.on_spawn(this, opoint, offset_velocity).attach();
    return entity
  }

  attach(): this {
    this.world.add_entities(this);
    if (EMPTY_FRAME_INFO === this.frame)
      this.enter_frame(Defines.FrameId.Auto);
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
    let { x, z } = this.velocities[0];
    factor *= this.world.friction_factor;
    x *= factor;
    z *= factor;

    if (x > 0) {
      x -= this.world.friction
      if (x < 0) x = 0; // 不能因为摩擦力反向加速
    } else if (x < 0) {
      x += this.world.friction;
      if (x > 0) x = 0;  // 不能因为摩擦力反向加速
    }

    if (z > 0) {
      z -= this.world.friction
      if (z < 0) z = 0; // 不能因为摩擦力反向加速
    } else if (z < 0) {
      z += this.world.friction;
      if (z > 0) z = 0; // 不能因为摩擦力反向加速
    }

    this.velocities[0].x = x;
    this.velocities[0].z = z;
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
    this.velocities[0].y -= this.state?.get_gravity(this) ?? this.world.gravity;
  }

  handle_frame_velocity() {
    if (this.shaking || this.motionless) return;
    const { dvx, dvy, dvz, speedz, speedx,
      vxm = SpeedMode.LF2,
      vym = SpeedMode.Add,
      vzm = SpeedMode.LF2,
      speedxm = SpeedMode.LF2,
      speedzm = SpeedMode.LF2,
    } = this.frame;
    let {
      x: vx,
      y: vy,
      z: vz
    } = this.velocities[0];
    if (dvx) vx = calc_v(vx, this.facing * dvx, vxm)
    if (dvy) vy = calc_v(vy, dvy, vym)
    if (dvz) vz = calc_v(vz, dvz, vzm);
    if (this._controller) {
      const { UD, LR } = this._controller;
      if (LR && speedx && speedx !== 550) vx = calc_v(vx, LR * speedx, speedxm);
      if (UD && speedz && speedz !== 550) vz = calc_v(vz, UD * speedz, speedzm);
    }
    if (dvx === 550) vx = 0;
    if (dvz === 550) vz = 0;
    if (dvy === 550) vy = 0;
    this.velocities[0].x = vx;
    this.velocities[0].y = vy;
    this.velocities[0].z = vz;
  }

  self_update(): void {
    if (this.next_frame) this.enter_frame(this.next_frame);
    if (this._mp < this._mp_max)
      this.mp = Math.min(this._mp_max, this._mp + this._mp_r_spd);
    if (this.frame.hp)
      this.hp -= this.frame.hp
    const { cpoint } = this.frame;
    if (cpoint?.decrease) {
      this._catch_time -= Math.abs(cpoint.decrease);
      if (this._catch_time < 0) this._catch_time = 0;
    }
    if (this.shaking <= 0) {
      for (const [k, v] of this.v_rests) {
        if (v.remain >= 0) --v.remain;
        else this.v_rests.delete(k);
      }
    }
    if (this.motionless <= 0)
      this._a_rest > 1 ? this._a_rest-- : this._a_rest = 0;

    if (this._invisible_duration > 0) {
      this._invisible_duration--;
      if (this._invisible_duration <= 0) {
        this._blinking_duration = 120;
      }
    }
    if (this._blinking_duration > 0) {
      this._blinking_duration--;
      if (this._blinking_duration <= 0) {
        if (this._after_blink === Defines.FrameId.Gone) {
          this.next_frame = void 0;
          this.frame = GONE_FRAME_INFO;
        }
      }
    }

    if (this.holder) {
      const { wpoint } = this.holder.frame;
      if (wpoint) { // 被丢出
        const { dvx, dvy, dvz } = wpoint;
        if (dvx !== void 0 || dvy !== void 0 || dvz !== void 0) {
          this.follow_holder()
          this.enter_frame(this.data.indexes?.throwing);
          const vz = this.holder.controller ? this.holder.controller.UD * (dvz || 0) : 0;
          const vx = (dvx || 0 - Math.abs(vz / 2)) * this.facing
          this.velocities[0].set(vx, dvy || 0, vz)
          this.holder.holding = void 0;
          this.holder = void 0;
        }
      }
      if (this.hp <= 0 && this.holder) {
        this.follow_holder()
        this.holder.holding = void 0;
        this.holder = void 0;
      }
    }

    switch (this.frame.state) {
      case Defines.State.Falling:
      case Defines.State.Lying:
      case Defines.State.Caught: {
        if (this.holding) {
          this.holding.follow_holder()
          this.holding.enter_frame(this.data.indexes?.in_the_sky);
          this.holding.holder = void 0;
          this.holding = void 0;
        }
        break;
      }
      case Defines.State.Burning:
      case Defines.State.Frozen:
      case Defines.State.Injured:
        break;
      case Defines.State.Defend:
      case Defines.State.BrokenDefend:
        if (this.resting > 0) {
          this.resting--;
        } else if (this.fall_value < this.fall_value_max) {
          this.fall_value += 1;
        }
        break;
      default: {
        if (this.resting > 0) {
          this.resting--;
        } else {
          if (this.fall_value < this.fall_value_max) {
            this.fall_value += 1;
          }
          if (this.defend_value < this.defend_value_max) {
            this.defend_value += 1;
          }
        }
      }
    }
  }

  update(): void {
    if (this.next_frame) this.enter_frame(this.next_frame);
    if (this.wait > 0) { --this.wait; }
    else { this.next_frame = this.frame.next; }
    this.state?.update(this);

    let vx = 0;
    let vy = 0;
    let vz = 0;
    for (const v of this.velocities) {
      vx += v.x;
      vy += v.y;
      vz += v.z;
    }
    this.velocity.set(vx, vy, vz);
    if (!this.shaking && !this.motionless) {
      this.position.x += vx;
      this.position.y += vy;
      this.position.z += vz;
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

    if (this.controller) {
      const { next_frame, key_list } = this.controller.update();
      if (
        key_list === 'ja' &&
        this.transform_datas &&
        this.transform_datas[1] === this.data &&
        (
          this.frame?.state === Defines.State.Walking ||
          this.frame?.state === Defines.State.Standing ||
          this.frame?.state === Defines.State.Defend
        )
      ) {
        this.transfrom_to_another();
        this.controller.reset_key_list();
      } else if (next_frame) {
        const result = this.get_next_frame(next_frame);
        if (result) this.next_frame = next_frame;
      }
    }

    if (this.position.y <= 0 && this.velocity.y < 0) {
      this.position.y = 0;
      this.play_sound(this.data.base.drop_sounds)
      this.velocities[0].y = 0;

      if (this.frame.on_landing) {
        const result = this.get_next_frame(this.frame.on_landing);
        if (result) this.next_frame = result.frame;
      }
      this.state?.on_landing?.(this);

      if (this.throwinjury !== void 0) {
        this.hp -= this.throwinjury;
        delete this.throwinjury;
      }
    }
    if (this.update_id === Number.MAX_SAFE_INTEGER)
      this.update_id = Number.MIN_SAFE_INTEGER
    else
      ++this.update_id;
    this.world.restrict(this);
    this.collision_list.length = 0;
    this.collided_list.length = 0;
  }

  /**
   * hp意外归0时，应该去的地方
   * @returns 
   */
  get_sudden_death_frame(): TNextFrame {
    return this.state?.get_sudden_death_frame?.(this) || { id: Defines.FrameId.Auto }
  }

  /**
   * 获取“被抓结束”帧
   * 
   * 被抓后，抓人者的“抓取值”降至0时，视为“被抓结束”，
   * 此时被抓者跳去的帧即为“被抓结束”帧
   * 
   * @returns 下帧信息 
   */
  get_caught_end_frame(): TNextFrame {
    return this.state?.get_caught_end_frame?.(this) || { id: Defines.FrameId.Auto }
  }

  /**
   * 获取“被抓取消”帧
   * 
   * 被抓后，抓人者的“抓取值”未降至0，且任意一方的帧缺少cpoint时，视为“被抓取消”，
   * 此时跳去的帧即为“被抓结束”帧
   * 
   * @returns 下帧信息 
   */
  get_caught_cancel_frame(): TNextFrame {
    if (this.position.y < 1) this.position.y = 1;
    return { id: Defines.FrameId.Auto }
  }

  private prev_cpoint_a?: ICpointInfo;
  update_caught(): TNextFrame | undefined {
    if (!this._catcher) return;
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
      return this.get_caught_cancel_frame()
    }
    if (this.prev_cpoint_a !== cpoint_a) {
      if (cpoint_a.injury) this.hp -= cpoint_a.injury;
      if (cpoint_a.shaking && cpoint_a.shaking > 0) this.shaking = cpoint_a.shaking;
    }
    this.prev_cpoint_a = cpoint_a;

    const { throwvx, throwvy, throwvz, throwinjury } = cpoint_a;
    if (throwvx) this.velocities[0].x = throwvx * this.facing;
    if (throwvy) this.velocities[0].y = throwvy;
    if (throwvz) this.velocities[0].z = throwvz;
    if (throwinjury) this.throwinjury = throwinjury;
    // this.velocity.z = throwvz * this._catcher.controller.UD1;

    if (throwvx || throwvy || throwvz) {
      delete this._catcher;
      this.prev_cpoint_a = void 0;
    }
    if (cpoint_a.vaction)
      return cpoint_a.vaction;
  }

  update_catching(): TNextFrame | undefined {
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

    const { throwvx, throwvy, throwvz, x: catch_x, y: catch_y, cover, throwinjury } = cpoint_a;
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
        return GONE_FRAME_INFO
      }
    }
    if (throwvx || throwvy || throwvz) {
      delete this._catching;
      return void 0;
    }

    /** "对齐颗粒度" */
    const { centerx: centerx_a, centery: centery_a } = this.frame;
    const { centerx: centerx_b, centery: centery_b } = this._catching.frame;
    const { x: caught_x, y: caught_y } = cpoint_b;
    const face_a = this.facing;
    const face_b = this._catching.facing;
    const { x: px, y: py, z: pz } = this.position;
    this._catching.position.x = px - face_a * (centerx_a - catch_x) + face_b * (centerx_b - caught_x);
    this._catching.position.y = py + centery_a - catch_y + caught_y - centery_b;
    this._catching.position.z = pz;
    if (cover === 11) this._catching.position.z -= 0.5;
    else if (cover === 10) this._catching.position.z += 0.5;
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
  get_catching_end_frame(): TNextFrame {
    return { id: Defines.FrameId.Auto }
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
  get_catching_cancel_frame(): TNextFrame {
    return { id: Defines.FrameId.Auto }
  }

  transfrom_to_another() {
    const { transform_datas } = this
    if (!transform_datas) return;
    const next_idx = (transform_datas.indexOf(this.data) + 1) % transform_datas.length;
    this.data = transform_datas[next_idx];
    this.next_frame = this.get_next_frame('245')?.frame;
  }

  lastest_collision?: CollisionInfo;
  lastest_collided?: CollisionInfo;
  collision_list: CollisionInfo[] = [];
  collided_list: CollisionInfo[] = [];

  start_catch(target: Entity, itr: IItrInfo) {
    if (itr.catchingact === void 0) {
      Warn.print(Entity.TAG + '::start_catch', 'cannot catch, catchingact got', itr.catchingact)
      return;
    }
    this._catch_time = this._catch_time_max;
    this._catching = target;
    this.next_frame = itr.catchingact
  }

  start_caught(attacker: Entity, itr: IItrInfo) {
    if (itr.caughtact === void 0) {
      Warn.print(Entity.TAG + '::start_caught', 'cannot be caught, caughtact got', itr.caughtact)
      return;
    }
    this._catcher = attacker;
    this.resting = 0;
    this.fall_value = this.fall_value_max;
    this.defend_value = this.defend_value_max;
    this.next_frame = itr.caughtact;
  }

  on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    if (this.state?.before_collision?.(this, target, itr, bdy, a_cube, b_cube)) {
      return;
    }
    this.collision_list.push(this.lastest_collision = {
      attacker: this,
      victim: target,
      aframe: this.frame,
      bframe: target.frame,
      itr,
      bdy,
      a_cube,
      b_cube,
    })
    this.motionless = itr.motionless ?? Defines.DEFAULT_ITR_MOTIONLESS;
    if (itr.arest) {
      this._a_rest = itr.arest - this.motionless;
    } else if (!itr.vrest) {
      this._a_rest = this.wait + this.motionless;
    }
    if (bdy.kind !== Defines.BdyKind.Defend) {
      this.play_sound(itr.hit_sounds);
    }
    if (itr.hit_act) this.next_frame = this.get_next_frame(itr.hit_act)?.frame ?? this.next_frame;
    this.state?.on_collision?.(this, target, itr, bdy, a_cube, b_cube);
  }

  spark_point(r0: ICube, r1: ICube) {
    const l = Math.max(r0.left, r1.left);
    const r = Math.min(r0.right, r1.right);
    const t = Math.min(r0.top, r1.top);
    const b = Math.max(r0.bottom, r1.bottom);
    const n = Math.min(r0.near, r1.near);
    const f = Math.max(r0.far, r1.far);
    const x = l + Math.random() * (r - l);
    const y = t + Math.random() * (b - t);
    const z = n + Math.random() * (f - n);
    return [x, y, z] as const;
  }

  dizzy_catch_test(target: Entity): boolean {
    return (
      is_character(this) &&
      is_character(target) && (
        (this.velocities[0].x > 0 && target.position.x > this.position.x) ||
        (this.velocities[0].x < 0 && target.position.x < this.position.x)
      )
    )
  }

  on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    if (this.state?.before_be_collided?.(attacker, this, itr, bdy, a_cube, b_cube)) {
      return;
    }
    this.collided_list.push(this.lastest_collided = {
      attacker: attacker,
      victim: this,
      aframe: attacker.frame,
      bframe: this.frame,
      itr,
      bdy,
      a_cube,
      b_cube,
    });
    this.shaking = itr.shaking ?? Defines.DEFAULT_ITR_SHAKEING;
    if (!itr.arest && itr.vrest) {
      this.v_rests.set(attacker.id, {
        remain: itr.vrest,
        itr,
        bdy,
        attacker,
        a_cube,
        b_cube,
        a_frame: attacker.frame,
        b_frame: this.frame
      });
    }
    if (
      bdy.kind >= Defines.BdyKind.GotoMin &&
      bdy.kind <= Defines.BdyKind.GotoMax
    ) {
      const result = this.get_next_frame('' + (bdy.kind - 1000))
      if (result) this.next_frame = result.frame
      return;
    }


    if (bdy.hit_act) this.next_frame = this.get_next_frame(bdy.hit_act)?.frame ?? this.next_frame;

    const sounds = bdy.hit_sounds || this.data.base.hit_sounds
    this.play_sound(sounds)
    this.state?.on_be_collided?.(attacker, this, itr, bdy, a_cube, b_cube);
  }

  dispose(): void {
    this.world.del_entity(this)
    this.controller = void 0;
    this._callbacks.emit('on_disposed')(this);
  }

  /**
   * 开始闪烁,闪烁完成后移除自己
   *
   * @param {number} duration 闪烁持续帧数
   */
  blink_and_gone(duration: number) {
    this._blinking_duration = duration;
    this._after_blink = Defines.FrameId.Gone;
  }

  /**
   * 开始闪烁
   *
   * @param {number} duration 闪烁持续帧数
   */
  blink(duration: number) {
    this._blinking_duration = duration;
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
    this._mp_r_spd = this._mp_r_spd_min + (this._mp_r_spd_max - this._mp_r_spd_min) * (this._hp_max - this._hp) / this._hp_max
  }

  same_team(other: Entity): boolean {
    return this.team === other.team;
  }

  follow_holder() {
    const holder = this.holder;
    if (!holder) return;
    const { wpoint: wpoint_a, centerx: centerx_a, centery: centery_a } = holder.frame;

    if (!wpoint_a) return;

    if (wpoint_a.weaponact !== this.frame.id) {
      this.enter_frame({ id: wpoint_a.weaponact })
    }
    const { wpoint: wpoint_b, centerx: centerx_b, centery: centery_b } = this.frame;
    if (!wpoint_b) return;

    const { x, y, z } = holder.position;
    this.facing = holder.facing;

    this.position.set(
      x + this.facing * (wpoint_a.x - centerx_a + centerx_b - wpoint_b.x),
      y + centery_a - wpoint_a.y - centery_b + wpoint_b.y,
      z - wpoint_a.cover / 2,
    );
  }


  protected _nearest_enemy: Entity | null = null;
  get nearest_enemy(): Entity | null { return this._nearest_enemy }
  set_nearest_enemy(e: Entity) {
    this._nearest_enemy = e;
  }
  subscribe_nearest_enemy() {
    this.world.nearest_enemy_requesters.add(this)
  }
  unsubscribe_nearest_enemy() {
    this.world.nearest_enemy_requesters.delete(this)
  }

  enter_frame(which?: TNextFrame | string): void {
    if (!which || this.frame.id === Defines.FrameId.Gone) return;
    const result = this.get_next_frame(which);
    if (!result) {
      this.next_frame = void 0;
      return
    }
    const { frame, which: flags } = result;
    const { sound } = frame;
    if (!this.world.lf2.infinity_mp) {
      const { mp, hp } = flags
      if (mp) this.mp -= mp
      if (hp) this.hp -= hp
    }
    if (sound) {
      const { x, y, z } = this.position;
      this.world.lf2.sounds.play(sound, x, y, z);
    }
    this.set_frame(frame);
    this.wait = frame.wait;
    this.next_frame = void 0;

    if (flags && typeof flags !== 'string') {
      if (flags.facing !== void 0) {
        this.facing = this.handle_facing_flag(flags.facing, frame);
      }
      if (flags.wait !== void 0) {
        this.wait = this.handle_wait_flag(flags.wait, frame);
      }
    }
  }

  handle_wait_flag(wait: string | number, frame: IFrameInfo): number {
    if (wait === 'i') return this.wait;
    if (wait === 'd') return Math.max(0, frame.wait - this.frame.wait + this.wait);
    if (is_positive(wait)) return wait;
    return frame.wait;
  }

  /**
   * 进入下一帧时，需要处理朝向
   * 
   * @see {Defines.FacingFlag}
   * @param facing 目标朝向, 可参考Defines.FacingFlag
   * @param frame 帧
   * @returns 返回新的朝向
   */
  handle_facing_flag(facing: number, frame: IFrameInfo): -1 | 1 {
    switch (facing) {
      case Defines.FacingFlag.ByController:
        return this.controller?.LR || this.facing;
      case Defines.FacingFlag.SameAsCatcher:
        return this._catcher?.facing || this.facing;
      case Defines.FacingFlag.OpposingCatcher:
        return turn_face(this._catcher?.facing) || this.facing;
      case Defines.FacingFlag.Backward:
        return turn_face(this.facing);
      case Defines.FacingFlag.Left:
      case Defines.FacingFlag.Right:
        return facing;
      default:
        return this.facing;
    }
  }

  get_next_frame(which: TNextFrame | string): INextFrameResult | undefined {
    if (Array.isArray(which)) {
      const l = which.length;
      for (let i = 0; i < l; ++i) {
        const f = this.get_next_frame(which[i]);
        if (f) return f
      }
      return void 0;
    }

    let id: string | string[] | undefined = void 0;
    let judger: IExpression<any> | undefined = void 0;
    let use_hp: number | undefined = void 0;
    let use_mp: number | undefined = void 0;
    // eslint-disable-next-line no-cond-assign
    if (is_str(which)) {
      id = which;
    } else {
      id = which.id;
      judger = which.judger;
      use_hp = which.hp
      use_mp = which.mp
    }

    if (judger && !judger.run(this)) {
      return void 0
    }
    const frame = this.find_frame_by_id(
      Array.isArray(id) ? random_get(id) : id
    );
    if (!frame) return void 0

    if (!this.world.lf2.infinity_mp) {
      if (this.frame.next === which) {
        // 用next 进入此动作，负数表示消耗，无视正数。若消耗完毕跳至按下防御键的指定跳转动作
        if (use_mp && this._mp < use_mp) return this.get_next_frame(frame.hit?.d ?? Defines.FrameId.Auto);
        if (use_hp && this._hp < use_hp) return this.get_next_frame(frame.hit?.d ?? Defines.FrameId.Auto);
      } else {
        if (use_mp && this._mp < use_mp) return void 0;
        if (use_hp && this._hp < use_hp) return void 0;
      }
    }
    return { frame, which: is_str(which) ? { id: which } : which };
  }

  find_frame_by_id(id: string | undefined): IFrameInfo | undefined {
    const r = this.state?.find_frame_by_id?.(this, id);
    if (r) return r

    switch (id) {
      case void 0:
      case Defines.FrameId.None:
      case Defines.FrameId.Self: return this.frame;
      case Defines.FrameId.Auto: return this.find_auto_frame();
      case Defines.FrameId.Gone: return GONE_FRAME_INFO;
    }
    if (!this.data.frames[id]) {
      console.warn(Entity.TAG + '::find_frame_by_id', 'frame not find! id:', id);
      debugger;
      return EMPTY_FRAME_INFO;
    }
    return this.data.frames[id];
  }

  get_prev_frame() { return this._prev_frame; }

  merge_velocities() {
    if (this.velocities.length <= 1)
      return;
    let vx = 0;
    let vy = 0;
    let vz = 0;
    for (const v of this.velocities) {
      vx += v.x;
      vy += v.y;
      vz += v.z;
    }
    this.velocities.length = 1;
    this.velocities[0].set(vx, vy, vz)
  }
}

Factory.inst.set_entity_creator('entity', (...args) => new Entity(...args));
Factory.inst.set_entity_creator('ball', (...args) => new Entity(...args));
Factory.inst.set_entity_creator('weapon', (...args) => new Entity(...args));
Factory.inst.set_entity_creator('character', (...args) => new Entity(...args));