
import * as THREE from 'three';
import { Warn } from '../../Log';
import { IBaseNode, IMeshNode } from '../3d';
import LF2 from '../LF2';
import type { World } from '../World';
import { ICube } from '../World';
import Callbacks from '../base/Callbacks';
import { NoEmitCallbacks } from "../base/NoEmitCallbacks";
import { new_id } from '../base/new_id';
import { IBallData, IBaseData, IBdyInfo, ICharacterData, IEntityData, IFrameInfo, IGameObjData, IGameObjInfo, IItrInfo, INextFrame, IOpointInfo, ITexturePieceInfo, IWeaponData, TFace, TNextFrame } from '../defines';
import IPicture from '../defines/IPicture';
import { Defines } from '../defines/defines';
import Ditto from '../ditto';
import create_pictures from '../loader/create_pictures';
import BaseState from "../state/base/BaseState";
import { States } from '../state/base/States';
import { ENTITY_STATES } from '../state/entity';
import { random_get } from '../utils/math/random';
import { is_nagtive, is_positive, is_str } from '../utils/type_check';
import { Factory } from './Factory';
import { FrameIndicators } from './FrameIndicators';
import type IEntityCallbacks from './IEntityCallbacks';
import { InfoSprite } from './InfoSprite';
import Shadow from './Shadow';
import { turn_face } from './face_helper';
import { is_entity } from './type_check';

export const EMPTY_PIECE: ITexturePieceInfo = {
  tex: 0, x: 0, y: 0, w: 0, h: 0,
  ph: 0, pw: 0,
}
export const EMPTY_FRAME_INFO: IFrameInfo = {
  id: Defines.FrameId.None,
  name: '',
  pic: 0,
  state: NaN,
  wait: 0,
  next: { id: Defines.FrameId.Auto },
  centerx: 0,
  centery: 0
};
export const GONE_FRAME_INFO: IFrameInfo = {
  id: Defines.FrameId.Gone,
  name: 'GONE_FRAME_INFO',
  pic: 0,
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
  readonly indicators: FrameIndicators = new FrameIndicators(this);
  readonly is_frame_animater = true
  readonly data: D;
  readonly world: World;
  readonly pictures: Map<string, IPicture<THREE.Texture>>;
  readonly inner: IMeshNode;
  readonly position = new THREE.Vector3(0, 0, 0);

  get catcher() { return this._catcher; }
  get lf2(): LF2 { return this.world.lf2 }
  get facing() { return this._facing; }
  set facing(v: TFace) {
    if (this._facing === v) { return; }
    this._facing = v;
    this.update_sprite();
  }
  private material: THREE.MeshBasicMaterial;
  readonly is_base_node = true;
  get parent() {
    throw new Error('Method not implemented.');
  }
  set parent(v: IBaseNode | undefined) {
    throw new Error('Method not implemented.');
  }
  get children(): readonly IBaseNode[] { return [] }
  get user_data(): Record<string, any> { return this.inner.user_data }
  set user_data(v: Record<string, any>) { this.inner.user_data = v }

  protected _piece: ITexturePieceInfo = EMPTY_PIECE;
  protected _facing: TFace = 1;
  protected _frame: F = EMPTY_FRAME_INFO as F;
  protected _next_frame: TNextFrame | undefined = void 0;
  protected _prev_frame: F = EMPTY_FRAME_INFO as F;
  protected _catching?: Entity;
  protected _catcher?: Entity;
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

  protected _info_sprite: InfoSprite;

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
    this.data = data;
    this.world = world;
    this.pictures = create_pictures(world.lf2, data);
    const first_text = this.pictures.get('0')?.texture;
    this.inner = new Ditto.MeshNode(
      world.lf2, {
      geometry: new THREE.PlaneGeometry(1, 1).translate(0.5, -0.5, 0),
      material: this.material = new THREE.MeshBasicMaterial({
        map: first_text,
        transparent: true,
      })
    }
    );
    if (first_text) first_text.onUpdate = () => this.inner.update_all_material()
    this.inner.user_data.owner = this;
    this.inner.visible = false;
    this.inner.name = "Entity:" + data.id
    this.states = states;
    this.shadow = new Shadow(this);
    this._info_sprite = new InfoSprite(this)
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

  set_frame(v: F) {
    this._prev_frame = this._frame;
    this._frame = v;
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

  spawn_object(opoint: IOpointInfo, speed_z: number = 0): Entity | undefined {
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

  attach(): this {
    this.update_sprite();
    this.world.add_entities(this);
    this.inner.visible = true;
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
    if (this._frame.dvy !== 550) this.velocity.y -= this.world.gravity;
  }

  private _previous = {
    face: (void 0) as TFace | undefined,
    frame: (void 0) as F | undefined,
  }
  protected update_sprite() {
    const frame = this.get_frame();
    if (
      this._previous.face === this._facing &&
      this._previous.frame === this._frame
    ) {
      return;
    }
    this._previous.face = this._facing;
    this._previous.frame = this._frame;
    const { inner } = this;
    const piece = frame.pic;
    if (typeof piece === 'number' || !('1' in piece)) {
      return;
    }
    if (this._piece !== piece[this._facing]) {
      const { x, y, w, h, tex, pw, ph } = this._piece = piece[this._facing];
      const pic = this.pictures.get('' + tex);
      if (pic) {
        pic.texture.offset.set(x, y);
        pic.texture.repeat.set(w, h);
        if (pic.texture !== this.material.map) {
          this.material.map = pic.texture;
        }
        inner.update_all_material()
      }
      inner.set_scale(pw, ph, 0)
    }
    this.update_sprite_position();

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

  self_update(): void {
    if (this._next_frame) this.enter_frame(this._next_frame);
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

  update(): void {
    if (this._next_frame) this.enter_frame(this._next_frame);
    if (this.wait > 0) { --this.wait; }
    else { this._next_frame = this._frame.next; }
    const { x, y, z } = this.position;
    const { centerx, centery } = this._frame
    const offset_x = this._facing === 1 ? centerx : this.inner.scale_x - centerx
    this.inner.set_position(x - offset_x, y - z / 2 + centery, z);
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

    if (is_entity(this._catcher)) {
      if (!this._catcher._catching_value) {
        delete this._catcher;
        return this.get_caught_end_frame();
      }
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
    const { cpoint: cpoint_b } = this._catching.get_frame();
    if (!cpoint_a || !cpoint_b) {
      delete this._catching;
      return this.get_catching_cancel_frame();
    }

    const { centerx: centerx_a, centery: centery_a } = this._frame;
    const { centerx: centerx_b, centery: centery_b } = this._catching.get_frame();
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

  update_sprite_position(): void {
    this.world.restrict(this);

    const { x, y, z } = this.position;
    const { centerx, centery } = this._frame
    const offset_x = this._facing === 1 ? centerx : this.inner.scale_x - centerx
    this.inner.set_position(x - offset_x, y - z / 2 + centery, z);

    this._info_sprite.update_position();
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
    this.inner.dispose()
    for (const [, pic] of this.pictures)
      pic.texture.dispose();
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

  get_object_3d() {
    return this.inner.get_object_3d()
  }

  enter_frame(which: TNextFrame | string): void {
    const [frame, flags] = this.get_next_frame(which);
    if (!frame) {
      this._next_frame = void 0;
      return
    }
    const { sound } = frame;
    const { x, y, z } = this.position;
    sound && this.world.lf2.sounds.play(sound, x, y, z);
    this.set_frame(frame);

    if (flags?.facing !== void 0) this.facing = this.handle_facing_flag(flags.facing, frame, flags);
    if (flags?.wait !== void 0) this.wait = this.handle_wait_flag(flags.wait, frame, flags);
    else this.wait = frame.wait;
    this.update_sprite();
    this._next_frame = void 0;
  }

  handle_wait_flag(wait: string | number, frame: IFrameInfo, flags: INextFrame): number {
    if (wait === 'i') return this.wait;
    if (is_positive(wait)) return this.wait;
    return frame.wait;
  }

  /**
   * 进入下一帧时，需要处理朝向
   * 
   * @see {Defines.FacingFlag}
   * @param facing 目标朝向, 可参考Defines.FacingFlag
   * @param frame 帧
   * @param flags 
   * @returns 返回新的朝向
   */
  handle_facing_flag(facing: number, frame: IFrameInfo, flags: INextFrame): -1 | 1 {
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

  get_frame() { return this._frame; }
  get_prev_frame() { return this._prev_frame; }

  apply(): this { this.inner.apply(); return this; }
  add(...sp: IBaseNode[]): this { this.inner.add(...sp); return this; }
  del(...sp: IBaseNode[]): this { this.inner.del(...sp); return this; }
  del_self(): this { this.inner.del_self(); return this; }
  get_user_data(key: string) { return this.inner.get_user_data(key) }
  add_user_data(key: string, value: any): this { this.inner.add_user_data(key, value); return this; }
  del_user_data(key: string): this { this.inner.del_user_data(key); return this; }
  merge_user_data(v: Record<string, any>): this { this.inner.merge_user_data(v); return this; }
}

Factory.inst.set('entity', (...args) => new Entity(...args));