import * as THREE from 'three';
import { Defines } from '../../js_utils/lf2_type/defines';
import BaseState from "../state/BaseState";
import { dat_mgr } from '../loader/DatLoader';
import { IBallData, IBaseData, IBdyInfo, ICharacterData, IEntityData, IFrameInfo, IGameObjData, IItrInfo, IOpointInfo, IWeaponData, TFace, TNextFrame } from '../../js_utils/lf2_type';
import { EntityIndicators } from './EntityIndicators';
import { factory } from '../Factory';
import { FrameAnimater } from '../FrameAnimater';
import type { World } from '../World';
import { ICube } from '../World';
import { create_picture_by_img_key } from '../loader/loader';

export type TData = IBaseData | ICharacterData | IWeaponData | IEntityData | IBallData
export const V_SHAKE = 4;
export const A_SHAKE = 4;
let __team__ = 4;
export class Entity<
  D extends IGameObjData = IGameObjData,
  F extends IFrameInfo = IFrameInfo
> extends FrameAnimater<D> {
  readonly shadow: THREE.Object3D;
  readonly velocity = new THREE.Vector3(0, 0, 0);

  hp: number = 500;
  team: number = ++__team__;
  readonly states: Map<number, BaseState>;

  v_rests = new Map<string, {
    remain: number,
    itr: IItrInfo,
    bdy: IBdyInfo,
    attacker: Entity,
    a_cube: ICube,
    b_cube: ICube,
    a_frame: IFrameInfo,
    b_frame: IFrameInfo
  }>();
  a_rest: number = 0;

  protected _motionless: number = 0
  protected _shaking: number = 0;
  protected _next_frame?: TNextFrame;
  protected _indicators: EntityIndicators | undefined = new EntityIndicators(this);
  protected _state: BaseState | undefined;
  get shaking() { return this._shaking; }
  get show_indicators() { return !!this._indicators?.show }
  set show_indicators(v: boolean) {
    if (!this._indicators)
      this._indicators = new EntityIndicators(this);
    this._indicators.show = v;
  }

  setup(shotter: Entity, o: IOpointInfo) {
    const shotter_frame = shotter.get_frame();
    this.team = shotter.team;
    this.face = (o.facing === 1 ? -shotter.face : shotter.face) as TFace;
    let { x, y, z } = shotter.position;
    y = y + shotter_frame.centery - o.y;
    x = x - shotter.face * (shotter_frame.centerx - o.x);
    this.position.set(x, y, z);
    this.enter_frame(o.action ?? 0);
    return this;
  }
  override set_frame(v: F) {
    const prev_state = this.get_frame().state;
    super.set_frame(v);
    const next_state = this.get_frame().state;
    if (prev_state !== next_state && next_state !== void 0) {
      this.state = this.states.get(next_state) || this.states.get(Defines.State.Any);
    }

    if (v.opoint) {
      for (const o of v.opoint) {
        const d = dat_mgr.find(o.oid);
        if (!d) {
          console.warn('data not found! id:', o.oid)
          continue;
        }
        const create = factory.get(d.type);
        if (!create) {
          console.warn('creator not found! ', d)
          continue;
        }
        create?.(this.world, d).setup(this, o).attach()
      }
    }
  }

  set state(v: BaseState | undefined) {
    if (this._state === v) return;
    this._state?.leave(this)
    this._state = v;
    this._state?.enter(this)
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

  velocity_decay() {
    if (this.position.y > 0 || this._shaking || this._motionless) return;
    let { x, z } = this.velocity;
    x *= this.world.friction_factor;
    this.velocity.z = z *= this.world.friction_factor;

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
  protected override update_sprite() {
    super.update_sprite();
    if (this._indicators?.show) this._indicators.update()
  }

  handle_frame_velocity() {
    if (this._shaking || this._motionless) return;
    const { dvx, dvy, dvz } = this.get_frame();
    if (dvx !== void 0 && dvx !== 0) {
      const next_speed = this._face * dvx;
      const curr_speed = this.velocity.x;
      if (
        (next_speed > 0 && curr_speed <= next_speed) ||
        (next_speed < 0 && curr_speed >= next_speed)
      )
        this.velocity.x = next_speed;
    };
    if (dvy !== void 0 && dvy !== 0) this.velocity.y += -dvy;
    if (dvz !== void 0 && dvz !== 0) this.velocity.z = dvz;
  }
  _s = [1, -1]
  _i = 0;
  update() {
    if (this._next_frame) {
      this.enter_frame(this._next_frame);
      delete this._next_frame;
    }
    this.on_before_update?.();
    this.on_before_state_update?.();
    this.state?.update(this);
    this.on_after_state_update?.();

    if (this._next_frame) {
      this.enter_frame(this._next_frame);
      delete this._next_frame;
    }
    if (!this._shaking && !this._motionless)
      this.position.add(this.velocity);

    if (this._motionless > 0) {
      --this._motionless;
    } else if (this._shaking > 0) {
      const wf = this._s[this._i = (this._i + 1) % 2] * 2 / this._piece.pw
      this.sprite.center.x += 4 * wf;
      --this._shaking;
    } else if (this.wait > 0) {
      --this.wait;
    };
    this.v_rests.forEach((v, k, m) => { v.remain > 1 ? v.remain-- : m.delete(k) });
    this.a_rest > 1 ? this.a_rest-- : this.a_rest = 0;

    this.on_after_update?.();

    if (this.position.y <= 0) {
      this.position.y = 0;
      if (this.velocity.y < 0) {
        this.velocity.y = this.on_landing?.() ?? 0;
      }
    }
    this.update_sprite_position();
  }

  override update_sprite_position(): void {
    this.world.restrict(this);
    super.update_sprite_position();
    const { x, z } = this.position;
    this.shadow.position.set(x, - z / 2, z);
  }
  on_before_state_update?(): void;
  on_after_state_update?(): void;
  on_landing?(): number | void | undefined;
  on_before_update?(): void;
  on_after_update?(): void;


  on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    if (itr.arest) this.a_rest = itr.arest;
    else if (!itr.vrest) this.a_rest = this.wait + A_SHAKE + 2;
    this._motionless = itr.motionless ?? A_SHAKE;
  }
  on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    if (!itr.arest && itr.vrest) this.v_rests.set(attacker.id, {
      remain: itr.vrest,
      itr, bdy, attacker, a_cube, b_cube,
      a_frame: attacker.get_frame(),
      b_frame: this.get_frame()
    });
    this._shaking = itr.shaking ?? V_SHAKE;
  }
  dispose(): void { }
}