
import { Warn } from '../../Log';
import LF2 from '../LF2';
import type { World } from '../World';
import { ICube } from '../World';
import { Callbacks, new_id, new_team, type NoEmitCallbacks } from '../base';
import { BaseController } from '../controller/BaseController';
import { BotController } from '../controller/BotController';
import { IBallData, IBaseData, IBdyInfo, ICharacterData, IEntityData, IFrameInfo, IGameObjData, IGameObjInfo, IItrInfo, INextFrame, IOpointInfo, ITexturePieceInfo, IWeaponData, TFace, TNextFrame } from '../defines';
import { Defines } from '../defines/defines';
import Ditto from '../ditto';
import { States, type BaseState } from '../state/base';
import { ENTITY_STATES } from '../state/entity';
import { random_get } from '../utils/math/random';
import { is_nagtive, is_positive, is_str } from '../utils/type_check';
import { Factory } from './Factory';
import type IEntityCallbacks from './IEntityCallbacks';
import { InfoSprite } from './InfoSprite';
import { turn_face } from './face_helper';
import { is_character } from './type_check';
export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: 0, x: 0, y: 0, w: 0, h: 0,
  ph: 0, pw: 0,
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
> {
  static readonly TAG: string = 'Entity';

  id: string = new_id();
  wait: number = 0;
  update_id: number = Number.MIN_SAFE_INTEGER;
  readonly is_frame_animater = true
  readonly data: D;
  readonly world: World;
  readonly position = new Ditto.Vector3(0, 0, 0);
  throwinjury?: number;

  get catcher() { return this._catcher; }
  get lf2(): LF2 { return this.world.lf2 }

  facing: TFace = 1;
  frame: F = EMPTY_FRAME_INFO as F;

  protected _next_frame: TNextFrame | undefined = void 0;
  protected _prev_frame: F = EMPTY_FRAME_INFO as F;
  protected _catching?: Entity;
  protected _catcher?: Entity;
  readonly is_entity = true
  readonly states: States;
  readonly velocity = new Ditto.Vector3(0, 0, 0);

  protected _callbacks = new Callbacks<IEntityCallbacks>()
  protected _name: string = '';
  protected _team: string = new_team();

  protected _mp: number = Defines.DAFAULT_MP;
  protected _max_mp: number = Defines.DAFAULT_MP;

  protected _hp: number = Defines.DAFUALT_HP;
  protected _max_hp: number = Defines.DAFUALT_HP;

  protected _mp_r_min_spd: number = 0;
  protected _mp_r_max_spd: number = 0;
  protected _mp_r_spd: number = Defines.DAFAULT_MP_RECOVERY_MIN_SPEED;

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

  info_sprite: InfoSprite;

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


  protected _state: BaseState | undefined;
  get shaking() { return this._shaking; }


  set state(v: BaseState | undefined) {
    if (this._state === v) return;
    this._state?.leave(this, this.get_frame())
    this._state = v;
    this._state?.enter(this, this.get_prev_frame())
  }

  get state() { return this._state; }

  /**
   * 闪烁计数
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

  constructor(world: World, data: D, states: States = ENTITY_STATES) {
    this.data = data;
    this.world = world;
    this.states = states;
    this.info_sprite = new InfoSprite(this)
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

  find_auto_frame() {
    return this.data.frames['0'] ?? this.get_frame();
  }
  on_spawn_by_emitter(emitter: Entity, o: IOpointInfo, speed_z: number = 0) {
    this._emitter = emitter;
    const shotter_frame = emitter.get_frame();
    this.team = emitter.team;
    this.facing = emitter.facing;

    let { x, y, z } = emitter.position;
    y = y + shotter_frame.centery - o.y;
    x = x - emitter.facing * (shotter_frame.centerx - o.x);
    this.position.set(x, y, z);
    this.enter_frame(o.action);

    this.velocity.z = speed_z

    if (o.dvx) this.velocity.x = (o.dvx - Math.abs(speed_z / 2)) * this.facing;
    if (o.dvy) this.velocity.y = o.dvy;
    if (o.dvz) this.velocity.z += o.dvz;

    return this;
  }

  set_frame(v: F) {
    this._prev_frame = this.frame;
    this.frame = v;
    const prev_state = this._prev_frame.state;
    const next_state = this.frame.state;
    if (prev_state !== next_state) {
      this.state = this.states.get(next_state) || this.states.get(Defines.State.Any);
    }
    if (v.invisible)
      this.invisibility(v.invisible)
    if (v.opoint) {
      for (const opoint of v.opoint) {
        const count = opoint.multi ?? 1
        for (let i = 0; i < count; ++i) {
          const s = 2 * (i - (count - 1) / 2);
          this.spawn_entity(opoint, s)
        }
      }
    }
    if (!v.cpoint)
      delete this._catching;
  }

  spawn_entity(opoint: IOpointInfo, speed_z: number = 0): Entity | undefined {
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
    const entity = create(this.world, d).on_spawn_by_emitter(this, opoint, speed_z).attach();
    if (is_character(entity)) entity.controller = new BotController(entity.id, entity)
    return entity
  }

  attach(): this {
    this.world.add_entities(this);
    return this;
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
    if (this.frame.dvy !== 550) this.velocity.y -= this.state?.get_gravity(this) ?? this.world.gravity;
  }


  handle_frame_velocity() {
    if (this._shaking || this._motionless) return;
    const { dvx, dvy, dvz } = this.get_frame();
    if (dvx === 550) this.velocity.x = 0;
    else if (dvx !== void 0) {
      const next_speed = this.facing * dvx;
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
  self_update(): void {
    // if (is_character(this) && controller_is_local_controller(this.controller)) {
    //   if (this.controller.ai)
    //     console.log('n', this._next_frame)
    // }
    if (this._next_frame) this.enter_frame(this._next_frame);
    if (this._mp < this._max_mp)
      this.mp = Math.min(this._max_mp, this._mp + this._mp_r_spd);

    const { cpoint } = this.frame;
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
      this.info_sprite.visible = false;
      if (this._invisible_duration <= 0) {
        this._blinking_duration = 120;
        this.info_sprite.visible = true
      }
    }
    if (this._blinking_duration > 0) {
      this._blinking_duration--;
      if (this._blinking_duration <= 0) {
        if (this._after_blink === Defines.FrameId.Gone) {
          this._next_frame = void 0;
          this.frame = GONE_FRAME_INFO as F
        }
      }
    }
  }

  update(): void {
    if (this._next_frame) this.enter_frame(this._next_frame);
    if (this.wait > 0) { --this.wait; }
    else { this._next_frame = this.frame.next; }
    this.state?.update(this);
    if (!this._shaking && !this._motionless)
      this.position.add(this.velocity);
    if (this._motionless > 0) {
      ++this.wait;
      --this._motionless;
    } else if (this._shaking > 0) {
      ++this.wait;
      --this._shaking;
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
  }

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
    const { cpoint: cpoint_a } = this._catcher.frame;
    const { cpoint: cpoint_b } = this.frame;
    if (!cpoint_a || !cpoint_b) {
      delete this._catcher;
      return this.get_caught_cancel_frame()
    }
    if (cpoint_a.injury) this.hp += cpoint_a.injury;
    if (cpoint_a.shaking) this._shaking = V_SHAKE;

    const { throwvx, throwvy, throwvz, throwinjury } = cpoint_a;
    if (throwvx) this.velocity.x = throwvx * this.facing;
    if (throwvy) this.velocity.y = throwvy;
    if (throwvz) this.velocity.z = throwvz;
    if (throwinjury) this.throwinjury = throwinjury;
    // this.velocity.z = throwvz * this._catcher.controller.UD1;

    if (throwvx || throwvy || throwvz) {
      delete this._catcher;
    }
    if (cpoint_a.vaction) return cpoint_a.vaction;
  }

  update_catching(): TNextFrame | undefined {
    if (!this._catching) return;

    if (!this._catching_value) {
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
    if (throwvx || throwvy || throwvz) {
      delete this._catching;
      return void 0;
    }
    if (throwinjury !== void 0) {
      if (throwinjury > 0) {
        // TODO：丢出后，被丢的人落地后的受到的伤害
        return;
      } else if (throwinjury === -1) {
        // TODO：变成抓住的人
        return;
      } else {
        return GONE_FRAME_INFO
      }
    }

    const { centerx: centerx_a, centery: centery_a } = this.frame;
    const { centerx: centerx_b, centery: centery_b } = this._catching.frame;
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

  on_after_update(): void {
    if (this.controller) {
      const next_frame_idx = this.controller.update();
      if (next_frame_idx) {
        const [a] = this.get_next_frame(next_frame_idx);
        if (a) this._next_frame = next_frame_idx;
      }
    }
  }

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

  protected update_mp_recovery_speed(): void {
    this._mp_r_spd = this._mp_r_min_spd + (this._mp_r_max_spd - this._mp_r_min_spd) * (this._max_hp - this._hp) / this._max_hp
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
      z
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

  enter_frame(which: TNextFrame | string): void {
    const [frame, flags] = this.get_next_frame(which);
    if (!frame) {
      this._next_frame = void 0;
      return
    }
    const { sound, mp = 0, hp = 0 } = frame;
    if (this.frame.next === which) {
      if (mp < 0) this.mp += mp;
      if (hp < 0) this.hp += hp;
    } else {
      if (mp) this.mp -= mp
      if (hp) this.hp -= hp
    }

    const { x, y, z } = this.position;
    sound && this.world.lf2.sounds.play(sound, x, y, z);
    this.set_frame(frame);

    if (flags?.facing !== void 0) this.facing = this.handle_facing_flag(flags.facing, frame);
    if (flags?.wait !== void 0) this.wait = this.handle_wait_flag(flags.wait, frame);
    else this.wait = frame.wait;
    this._next_frame = void 0;

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
      case Defines.FacingFlag.Backward:
        return turn_face(this.facing);
      case Defines.FacingFlag.Left:
      case Defines.FacingFlag.Right:
        return facing;
      default:
        return this.facing;
    }
  }

  get_next_frame(which: TNextFrame | string): [F | undefined, INextFrame | undefined] {
    if (is_str(which)) {
      const frame = this.find_frame_by_id(which);
      return [frame, void 0];
    }
    if (Array.isArray(which)) {
      const l = which.length;
      const remains: INextFrame[] = [];
      for (let i = 0; i < l; ++i) {
        const w = which[i];
        const { expression: condition } = w;
        if (typeof condition !== 'function') {
          remains.push(w);
          continue;
        }
        if (condition(this)) {
          return this.get_next_frame(w);
        }
      }
      if (!remains.length) return [void 0, void 0];
      which = random_get(remains)!;
      return this.get_next_frame(which);
    }
    let { id } = which;
    if (Array.isArray(id)) id = random_get(id);
    const frame = this.find_frame_by_id(id);
    return [frame, which];
  }

  find_frame_by_id(id: string | undefined): F;
  find_frame_by_id(id: string | undefined, exact: true): F | undefined;
  find_frame_by_id(id: string | undefined, exact: boolean = false): F | undefined {
    if (exact) return id ? this.data.frames[id] : void 0;
    switch (id) {
      case void 0:
      case Defines.FrameId.None:
      case Defines.FrameId.Self: return this.get_frame();
      case Defines.FrameId.Auto: return this.find_auto_frame();
      case Defines.FrameId.Gone: return GONE_FRAME_INFO as F;
    }
    if (!this.data.frames[id]) {
      Warn.print(Entity.TAG + '::find_auto_frame', 'find_frame_by_id(id), frame not find! id:', id);
      return EMPTY_FRAME_INFO as F;
    }
    return this.data.frames[id];
  }

  get_frame() { return this.frame; }
  get_prev_frame() { return this._prev_frame; }
}

Factory.inst.set('entity', (...args) => new Entity(...args));