import * as THREE from 'three';
import { Log, Warn } from '../../Log';
import { constructor_name } from '../../js_utils/constructor_name';
import { is_nagtive_num } from '../../js_utils/is_nagtive_num';
import { IBallData, IBaseData, IBdyInfo, ICharacterData, IEntityData, IFrameInfo, IGameObjData, IGameObjInfo, IItrInfo, IOpointInfo, IWeaponData, TNextFrame } from '../../js_utils/lf2_type';
import { Defines } from '../../js_utils/lf2_type/defines';
import { factory } from '../Factory';
import { FrameAnimater } from '../FrameAnimater';
import type { World } from '../World';
import { ICube } from '../World';
import { dat_mgr } from '../loader/DatLoader';
import { create_picture_by_img_key } from '../loader/loader';
import BaseState from "../state/BaseState";
import { EntityIndicators } from './EntityIndicators';
import type { Weapon } from './Weapon';
import { turn_face } from './face_helper';
export type TData = IBaseData | ICharacterData | IWeaponData | IEntityData | IBallData
export const V_SHAKE = 4;
export const A_SHAKE = 6;
let __team__ = 4;

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
export class Entity<
  F extends IFrameInfo = IFrameInfo,
  I extends IGameObjInfo = IGameObjInfo,
  D extends IGameObjData<I, F> = IGameObjData<I, F>
> extends FrameAnimater<F, I, D> {
  static new_team() {
    return ++__team__;
  }
  readonly shadow: THREE.Object3D;
  readonly velocity = new THREE.Vector3(0, 0, 0);

  hp: number = 50000000000;
  team: number = Entity.new_team();
  readonly states: Map<number, BaseState>;

  v_rests = new Map<string, IVictimRest>();
  a_rest: number = 0;

  protected _motionless: number = 0
  protected _shaking: number = 0;
  readonly indicators: EntityIndicators = new EntityIndicators(this);
  protected _state: BaseState | undefined;
  get shaking() { return this._shaking; }
  get show_indicators() { return !!this.indicators?.show }
  set show_indicators(v: boolean) { this.indicators.show = v; }

  /** 
   * 抓人剩余值
   * 
   * 当抓住一个被击晕的人时，此值充满。
   */
  protected _catching_value = 602;

  setup(shotter: Entity, o: IOpointInfo, speed_z: number = 0) {
    const shotter_frame = shotter.get_frame();
    this.team = shotter.team;
    this.facing = o.facing === Defines.FacingFlag.Backward ? turn_face(shotter.facing) : shotter.facing;

    let { x, y, z } = shotter.position;
    y = y + shotter_frame.centery - o.y;
    x = x - shotter.facing * (shotter_frame.centerx - o.x);
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
    const prev_state = this._prev_frame.state;
    const next_state = this._frame.state;
    if (prev_state !== next_state) {
      this.state = this.states.get(next_state) || this.states.get(Defines.State.Any);
    }
    if (v.opoint) {
      for (const opoint of v.opoint) {
        for (let i = 0; i < opoint.multi; ++i) {
          const s = 2 * (i - (opoint.multi - 1) / 2);
          this.spawn_object(opoint, s)
        }
      }
    }
  }

  spawn_object(opoint: IOpointInfo, speed_z: number = 0): Entity | undefined {
    const d = dat_mgr.find(opoint.oid);
    if (!d) {
      Warn.print(constructor_name(this), 'spawn_object(), data not found! opoint:', opoint);
      return;
    }
    const create = factory.get(d.type);
    if (!create) {
      Warn.print(constructor_name(this), `spawn_object(), creator of "${d.type}" not found! opoint:`, opoint);
      return;
    }
    return create(this.world, d).setup(this, opoint, speed_z).attach()
  }

  set state(v: BaseState | undefined) {
    if (this._state === v) return;
    this._state?.leave(this, this.get_frame())
    this._state = v;
    this._state?.enter(this, this.get_prev_frame())
  }

  get state() { return this._state; }

  constructor(world: World, data: D, states: Map<number, BaseState> = new Map()) {
    super(world, data)

    this.pictures.set('shadow', create_picture_by_img_key('shadow', 'shadow').data);
    this.states = states;
    const [sw, sh] = this.world.bg?.data.base.shadowsize || [30, 30]
    const geometry = new THREE.PlaneGeometry(sw, 2 * sh);
    const shadow_material = new THREE.MeshBasicMaterial({
      map: this.pictures.get('shadow')?.texture!,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.shadow = new THREE.Mesh(geometry, shadow_material);
    this.shadow.renderOrder = 0
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
    this.velocity.y -= this.world.gravity;
  }

  _s = [1, -1]
  _i = 0;

  protected override update_sprite() {
    super.update_sprite();
    if (this._shaking) {
      const wf = this._s[this._i = (this._i + 1) % 2] * 2 / this._piece.pw
      this.sprite.center.x += 4 * wf;
    }
    this.weapon?.follow_holder();
  }

  handle_frame_velocity() {
    if (this._shaking || this._motionless) return;
    const { dvx, dvy, dvz } = this.get_frame();
    if (dvx !== void 0) {
      const next_speed = this._facing * dvx;
      const curr_speed = this.velocity.x;
      if (
        (next_speed > 0 && curr_speed <= next_speed) ||
        (next_speed < 0 && curr_speed >= next_speed)
      )
        this.velocity.x = next_speed;
    };
    if (dvy !== void 0) this.velocity.y += dvy;
    if (dvz !== void 0) this.velocity.z = dvz;
  }

  override self_update(): void {
    super.self_update();
    const { cpoint } = this._frame;
    if (cpoint && is_nagtive_num(cpoint.decrease)) {
      this._catching_value += cpoint.decrease;
      if (this._catching_value < 0) this._catching_value = 0;
    }
    if (this._shaking <= 0)
      this.v_rests.forEach((v, k, m) => { v.remain > 1 ? v.remain-- : m.delete(k) });
    this.a_rest > 1 ? this.a_rest-- : this.a_rest = 0;
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

  weapon?: Weapon;

  protected _catching?: Entity;
  protected _catcher?: Entity;
  get catcher() { return this._catcher }

  /**
   * 获取“被抓结束”帧
   * 
   * 被抓后，抓人者的“抓取值”降至0时，视为“被抓结束”，
   * 此时被抓者跳去的帧即为“被抓结束”帧
   * 
   * @returns 下帧信息 
   */
  get_caught_end_frame(): TNextFrame {
    return { id: Defines.ReservedFrameId.Auto }
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
    return { id: Defines.ReservedFrameId.Auto }
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
    return { id: Defines.ReservedFrameId.Auto }
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
    return { id: Defines.ReservedFrameId.Auto }
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
    const { x, z } = this.position;
    this.shadow.position.set(x, - z / 2, z);
    this.weapon?.follow_holder();
  }

  on_after_update?(): void;

  on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    this._motionless = itr.motionless ?? 4;
    if (itr.arest) {
      this.a_rest = itr.arest;
      Log.print('on_collision', '1, this.a_rest =', this.a_rest)
    } else if (!itr.vrest) {
      this.a_rest = this.wait + A_SHAKE + this._motionless;
      Log.print('on_collision', '2, this.a_rest =', this.a_rest)
    }
  }
  on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    this._shaking = itr.shaking ?? V_SHAKE;
    if (!itr.arest && itr.vrest) this.v_rests.set(attacker.id, {
      remain: itr.vrest - this._shaking,
      itr, bdy, attacker, a_cube, b_cube,
      a_frame: attacker.get_frame(),
      b_frame: this.get_frame()
    });
  }
  dispose(): void { this.indicators.dispose() }
}