
import * as THREE from 'three';
import { Warn } from '../../Log';
import type { World } from '../World';
import { ICube } from '../World';
import Callbacks from '../base/Callbacks';
import { NoEmitCallbacks } from "../base/NoEmitCallbacks";
import { IBallData, IBaseData, IBdyInfo, ICharacterData, IEntityData, IFrameInfo, IGameObjData, IGameObjInfo, IItrInfo, IOpointInfo, IWeaponData, TNextFrame } from '../defines';
import { Defines } from '../defines/defines';
import BaseState from "../state/base/BaseState";
import { States } from '../state/base/States';
import { ENTITY_STATES } from '../state/entity';
import { constructor_name } from '../utils/constructor_name';
import { is_nagtive } from '../utils/type_check';
import { EntityIndicators } from './EntityIndicators';
import { Factory } from './Factory';
import FrameAnimater, { GONE_FRAME_INFO } from './FrameAnimater';
import type IEntityCallbacks from './IEntityCallbacks';
import { InfoSprite } from './InfoSprite';
import Shadow from './Shadow';
import { turn_face } from './face_helper';

export type TData = IBaseData | ICharacterData | IWeaponData | IEntityData | IBallData
export const V_SHAKE = 6;
export const A_SHAKE = 6;
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
export default class Entity<
  F extends IFrameInfo = IFrameInfo,
  I extends IGameObjInfo = IGameObjInfo,
  D extends IGameObjData<I, F> = IGameObjData<I, F>
> extends FrameAnimater<F, I, D> {
  static readonly TAG: string = 'Entity';
  readonly is_entity = true
  readonly states: States;
  readonly shadow: Shadow;
  readonly velocity = new THREE.Vector3(0, 0, 0);

  protected _callbacks = new Callbacks<IEntityCallbacks>()
  protected _name: string = '';
  protected _team: string = '';

  protected _mp: number = Defines.MP;
  protected _max_mp: number = Defines.MP;

  protected _hp: number = Defines.HP;
  protected _max_hp: number = Defines.HP;

  protected _mp_r_min_spd: number = 0;
  protected _mp_r_max_spd: number = 0;
  protected _mp_r_spd: number = Defines.MP_RECOVERY_MIN_SPEED;

  protected _holder?: Entity;
  protected _holding?: Entity;
  protected _emitter?: Entity;
  protected _a_rest: number = 0;
  protected _v_rests = new Map<string, IVictimRest>();

  protected _motionless: number = 0
  protected _shaking: number = 0;
  /** 
   * 抓人剩余值
   * 
   * 当抓住一个被击晕的人时，此值充满。
   */
  protected _catching_value = 602;


  /**
   * 隐身计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _invisible_duration: number = -1;

  /**
   * 闪烁计数，每帧-1
   *
   * @protected
   * @type {number}
   */
  protected _blinking_duration: number = -1;

  /**
   * 闪烁完毕后下一动作
   *
   * @protected
   * @type {string | TNextFrame}
   */
  protected _after_blink: string | TNextFrame | null = null;

  protected _info_sprite: InfoSprite = new InfoSprite(this);

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
  }

  get hp(): number { return this._hp; }
  set hp(v: number) {
    const o = this._hp;
    this._callbacks.emit('on_hp_changed')(this, this._hp = v, o)
    this.update_mp_recovery_speed();
  }

  get max_mp(): number { return this._max_mp; }
  set max_mp(v: number) {
    const o = this._max_mp;
    this._callbacks.emit('on_max_mp_changed')(this, this._max_mp = v, o)
  }

  get max_hp(): number { return this._max_hp; }
  set max_hp(v: number) {
    const o = this._max_hp;
    this._callbacks.emit('on_max_hp_changed')(this, this._max_hp = v, o)
    this.update_mp_recovery_speed();
  }

  get mp_recovery_min_speed(): number { return this._mp_r_min_spd; }
  set mp_recovery_min_speed(v: number) { this._mp_r_min_spd = v; }

  get mp_recovery_max_speed(): number { return this._mp_r_max_spd; }
  set mp_recovery_max_speed(v: number) { this._mp_r_max_spd = v; }

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

  readonly indicators: EntityIndicators = new EntityIndicators(this);
  protected _state: BaseState | undefined;
  get shaking() { return this._shaking; }
  get show_indicators() { return !!this.indicators?.show }
  set show_indicators(v: boolean) { this.indicators.show = v; }


  set state(v: BaseState | undefined) {
    if (this._state === v) return;
    this._state?.leave(this, this.get_frame())
    this._state = v;
    this._state?.enter(this, this.get_prev_frame())
  }

  get state() { return this._state; }

  /**
   * 是否处于闪烁状态
   *
   * @readonly
   * @type {boolean}
   */
  get blinking() { return this._blinking_duration > 0 }


  /**
   * 是否处于隐身状态
   *
   * @readonly
   * @type {boolean}
   */
  get invisible() { return this._invisible_duration > 0 }


  get callbacks(): NoEmitCallbacks<IEntityCallbacks> {
    return this._callbacks
  }

  constructor(world: World, data: D, states: States = ENTITY_STATES) {
    super(world, data)
    this.inner.name = "Entity:" + data.id
    this.states = states;
    this.shadow = new Shadow(this);
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
    const v = this._v_rests.get(id);
    return v ? v.remain : 0
  }

  find_v_rest(fn: (k: string, v: IVictimRest) => any): IVictimRest | undefined {
    for (const [k, v] of this._v_rests) if (fn(k, v)) return v;
    return void 0;
  }
  override find_auto_frame() {
    return this.data.frames['0'] ?? super.get_frame();
  }
  override on_spawn_by_emitter(emitter: Entity, o: IOpointInfo, speed_z: number = 0) {
    this._emitter = emitter;
    const shotter_frame = emitter.get_frame();
    this.team = emitter.team;
    this.facing = o.facing === Defines.FacingFlag.Backward ? turn_face(emitter.facing) : emitter.facing;

    let { x, y, z } = emitter.position;
    y = y + shotter_frame.centery - o.y;
    x = x - emitter.facing * (shotter_frame.centerx - o.x);
    this.position.set(x, y, z);
    this.enter_frame(o.action);

    this.velocity.z = speed_z

    if (o.dvx) this.velocity.x = (o.dvx - Math.abs(speed_z / 2)) * this.facing;
    if (o.dvy) this.velocity.y = 2 * o.dvy;
    if (o.dvz) this.velocity.z += o.dvz;

    return this;
  }

  override set_frame(v: F) {
    super.set_frame(v);
    this.shadow.visible = !v.no_shadow;
    const prev_state = this._prev_frame.state;
    const next_state = this._frame.state;
    if (prev_state !== next_state) {
      this.state = this.states.get(next_state) || this.states.get(Defines.State.Any);
    }
    if (v.invisible)
      this.invisibility(v.invisible)
    if (v.opoint) {
      for (const opoint of v.opoint) {
        for (let i = 0; i < opoint.multi; ++i) {
          const s = 2 * (i - (opoint.multi - 1) / 2);
          this.spawn_object(opoint, s)
        }
      }
    }
    if (!v.cpoint)
      delete this._catching;
  }

  spawn_object(opoint: IOpointInfo, speed_z: number = 0): FrameAnimater | undefined {
    const d = this.world.lf2.datas.find(opoint.oid);
    if (!d) {
      Warn.print(Entity.TAG + '::spawn_object', 'data not found! opoint:', opoint);
      return;
    }
    const create = Factory.inst.get(d.type);
    if (!create) {
      Warn.print(Entity.TAG + '::spawn_object', `creator of "${d.type}" not found! opoint:`, opoint);
      return;
    }
    return create(this.world, d).on_spawn_by_emitter(this, opoint, speed_z).attach()
  }

  velocity_decay(factor: number = 1) {
    if (this.position.y > 0 || this._shaking || this._motionless) return;
    let { x, z } = this.velocity;
    x *= this.world.friction_factor * factor;
    this.velocity.z = z *= this.world.friction_factor * factor;

    if (x > 0) {
      x -= this.world.friction
      if (x < 0) x = 0;
      this.velocity.x = x;
    } else if (x < 0) {
      x += this.world.friction;
      if (x > 0) x = 0;
      this.velocity.x = x;
    }

    if (z > 0) {
      z -= this.world.friction
      if (z < 0) z = 0;
      this.velocity.z = z;
    } else if (z < 0) {
      z += this.world.friction;
      if (z > 0) z = 0;
      this.velocity.z = z;
    }
  }

  on_gravity() {
    if (this.position.y <= 0 || this._shaking || this._motionless) return;
    if (this._frame.dvy !== 550) this.velocity.y -= this.world.gravity;
  }

  protected override update_sprite() {
    super.update_sprite();
    this.holding?.follow_holder();
    if (this._shaking) {
      const x = (this._shaking % 2 ? -5 : 5);
      this.inner.x += x;
    }
  }

  handle_frame_velocity() {
    if (this._shaking || this._motionless) return;
    const { dvx, dvy, dvz } = this.get_frame();
    if (dvx === 550) this.velocity.x = 0;
    else if (dvx !== void 0) {
      const next_speed = this._facing * dvx;
      const curr_speed = this.velocity.x;
      if (
        (next_speed > 0 && curr_speed <= next_speed) ||
        (next_speed < 0 && curr_speed >= next_speed)
      )
        this.velocity.x = next_speed;
    };

    if (dvy === 550) this.velocity.y = 0;
    else if (dvy !== void 0) this.velocity.y += dvy;

    if (dvz === 550) this.velocity.z = 0;
    else if (dvz !== void 0) this.velocity.z = dvz;
  }

  override self_update(): void {
    super.self_update();
    if (this._mp < this._max_mp)
      this.mp = Math.min(this._max_mp, this._mp + this._mp_r_spd);

    const { cpoint } = this._frame;
    if (cpoint && is_nagtive(cpoint.decrease)) {
      this._catching_value += cpoint.decrease;
      if (this._catching_value < 0) this._catching_value = 0;
    }
    if (this._shaking <= 0) {
      for (const [k, v] of this._v_rests) {
        if (v.remain >= 0) --v.remain;
        else this._v_rests.delete(k);
      }
    }
    this._a_rest > 1 ? this._a_rest-- : this._a_rest = 0;
    if (this._invisible_duration > 0) {
      this._invisible_duration--;
      this.inner.visible = this.shadow.visible = this._info_sprite.visible = false;
      if (this._invisible_duration <= 0) {
        this._blinking_duration = 120;
        this._info_sprite.visible = true
      }
    }
    if (this._blinking_duration > 0) {
      this._blinking_duration--;
      const bc = Math.floor(this._blinking_duration / 6) % 2;
      if (this._blinking_duration <= 0) {
        this.inner.visible = true;
        this.shadow.visible = !this._frame.no_shadow
        if (this._after_blink === Defines.FrameId.Gone) {
          this._next_frame = void 0;
          this._frame = GONE_FRAME_INFO as F
        }
      } else {
        this.inner.visible = !!bc;
        this.shadow.visible = !!bc && !this._frame.no_shadow
      }
    }

  }
  override update(): void {
    super.update();
    this.state?.update(this);
    if (!this._shaking && !this._motionless)
      this.position.add(this.velocity);
    if (this._motionless > 0) {
      ++this.wait;
      --this._motionless;
    } else if (this._shaking > 0) {
      ++this.wait;
      --this._shaking;
      this.update_sprite();
    }

    const next_frame_1 = this.update_catching();
    const next_frame_2 = this.update_caught();
    this._next_frame = next_frame_2 || next_frame_1 || this._next_frame;

    this.on_after_update?.();
    if (this.position.y <= 0 && this.velocity.y < 0) {
      this.position.y = 0;
      const { x, y, z } = this.velocity;
      this.velocity.y = 0;
      this.state?.on_landing(this, x, y, z);
    }
  }

  protected _catching?: Entity;
  protected _catcher?: Entity;
  get catcher() { return this._catcher }

  get_sudden_death_frame(): TNextFrame {
    return { id: Defines.FrameId.Auto }
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
    return { id: Defines.FrameId.Auto }
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


  update_caught(): TNextFrame | undefined {
    if (!this._catcher) return;

    if (!this._catcher._catching_value) {
      delete this._catcher;
      return this.get_caught_end_frame();
    }

    const { cpoint: cpoint_a } = this._catcher.get_frame();
    const { cpoint: cpoint_b } = this._frame;
    if (!cpoint_a || !cpoint_b) {
      delete this._catcher;
      return this.get_caught_cancel_frame()
    }
    if (cpoint_a.injury) this.hp += cpoint_a.injury;
    if (cpoint_a.shaking) this._shaking = V_SHAKE;

    const { throwvx, throwvy, throwvz } = cpoint_a;
    if (throwvx) this.velocity.x = throwvx * this.facing;
    if (throwvy) this.velocity.y = throwvy;
    if (throwvz) this.velocity.z = throwvz;
    // this.velocity.z = throwvz * this._catcher.controller.UD1;

    if (throwvx || throwvy || throwvz) {
      delete this._catcher;
    }
    if (cpoint_a.vaction) return cpoint_a.vaction;
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

  update_catching(): TNextFrame | undefined {
    if (!this._catching) return;

    if (!this._catching_value) {
      delete this._catching;
      return this.get_catching_end_frame();
    }

    const { cpoint: cpoint_a } = this._frame;
    const { cpoint: cpoint_b } = this._catching._frame;
    if (!cpoint_a || !cpoint_b) {
      delete this._catching;
      return this.get_catching_cancel_frame();
    }

    const { centerx: centerx_a, centery: centery_a } = this._frame;
    const { centerx: centerx_b, centery: centery_b } = this._catching._frame;
    const { throwvx, throwvy, throwvz, x: catch_x, y: catch_y, cover } = cpoint_a;
    if (throwvx || throwvy || throwvz) {
      delete this._catching;
      return void 0;
    }

    const { x: caught_x, y: caught_y } = cpoint_b;
    const face_a = this.facing;
    const face_b = this._catching.facing;
    const { x: px, y: py, z: pz } = this.position;
    this._catching.position.x = px - face_a * (centerx_a - catch_x) + face_b * (centerx_b - caught_x);
    this._catching.position.y = py + centery_a - catch_y + caught_y - centery_b;
    this._catching.position.z = pz;
    if (cover === 11) this._catching.position.z += 1;
    else if (cover === 10) this._catching.position.z -= 1;
  }

  override update_sprite_position(): void {
    this.world.restrict(this);
    super.update_sprite_position();
    this._info_sprite.update_position();
    const { x, z } = this.position;
    this.shadow.mesh.set_position(x, - z / 2, z - 550);
    if (this.holding) this.holding.follow_holder();
  }

  on_after_update?(): void;

  on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    this._motionless = itr.motionless ?? 4;
    if (itr.arest) {
      this._a_rest = itr.arest;
    } else if (!itr.vrest) {
      this._a_rest = this.wait + A_SHAKE + this._motionless;
    }
  }

  on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    this._shaking = itr.shaking ?? V_SHAKE;
    if (!itr.arest && itr.vrest) this._v_rests.set(attacker.id, {
      remain: itr.vrest - this._shaking,
      itr, bdy, attacker, a_cube, b_cube,
      a_frame: attacker.get_frame(),
      b_frame: this.get_frame()
    });
    if (bdy.kind >= Defines.BdyKind.GotoMin && bdy.kind <= Defines.BdyKind.GotoMax) {
      this._next_frame = { id: '' + (bdy.kind - 1000) }
    }
  }

  dispose(): void {
    super.dispose();
    this.indicators.dispose();
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

  protected update_mp_recovery_speed(): void {
    this._mp_r_spd = this._mp_r_min_spd + (this._mp_r_max_spd - this._mp_r_min_spd) * (this._max_hp - this._hp) / this._max_hp
  }

  belong(other: Entity): boolean {
    if (!this.emitter) return false;
    if (this.emitter === other) return true;
    return this.emitter.belong(other);
  }

  same_team(other: Entity): boolean {
    const a_team = this.team;
    const b_team = other.team;
    if (a_team && a_team === b_team) return true;
    return this.belong(other) || other.belong(this) || (!!this.emitter && this.emitter === other.emitter);
  }

  follow_holder() {
    const holder = this.holder;
    if (!holder) return;
    const { wpoint: wpoint_a, centerx: centerx_a, centery: centery_a } = holder.get_frame();

    if (!wpoint_a) return;

    if (wpoint_a.weaponact !== this._frame.id) {
      this.enter_frame({ id: wpoint_a.weaponact })
    }
    const { wpoint: wpoint_b, centerx: centerx_b, centery: centery_b } = this.get_frame();
    if (!wpoint_b) return;

    const { x, y, z } = holder.position;
    this.facing = holder.facing;
    this.position.set(
      x + this.facing * (wpoint_a.x - centerx_a + centerx_b - wpoint_b.x),
      y + centery_a - wpoint_a.y - centery_b + wpoint_b.y,
      z
    );
    this.update_sprite_position()
  }


  protected _nearest_enemy: Entity | null = null;
  get nearest_enemy(): Entity | null { return this._nearest_enemy }
  set_nearest_enemy(e: Entity) {
    this._nearest_enemy = e;
  }
  subscribe_nearest_enemy() {
    this.world.nearest_enemy_requester.add(this)
  }
  unsubscribe_nearest_enemy() {
    this.world.nearest_enemy_requester.delete(this)
  }
}

Factory.inst.set('entity', (...args) => new Entity(...args));