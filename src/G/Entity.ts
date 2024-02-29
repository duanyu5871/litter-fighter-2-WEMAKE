import * as THREE from 'three';
import BaseState from "../BaseState";
import { Defines } from '../defines';
import { EntityIndicators } from './EntityIndicators';
import GameObj from './GameObj';
import type World from './World';
import { create_picture, simple_picture_info } from './loader/loader';
import { ICube } from './World';

export type TData = IBaseData | ICharacterData | IWeaponData | IEntityData | IProjecttileData

export const V_SHAKE = 4;
export const A_SHAKE = 4;
export default class Entity<D extends IGameObjData = IGameObjData> extends GameObj<D> {
  readonly shadow: THREE.Object3D;
  readonly velocity = new THREE.Vector3(0, 0, 0);
  readonly team: number = 0;
  readonly states: Map<number, BaseState>;

  v_rests = new Map<string, number>();
  a_rest: number = 0;

  protected _motionless: number = 0
  protected _shaking: number = 0;
  protected _next_frame: TNextFrame | undefined = void 0;
  protected _indicators: EntityIndicators | undefined = new EntityIndicators(this);
  protected _state: BaseState | undefined;

  get show_indicators() { return !!this._indicators?.show }
  set show_indicators(v: boolean) {
    if (!this._indicators)
      this._indicators = new EntityIndicators(this);
    this._indicators.show = v;
  }

  override set_frame(v: IFrameInfo) {
    const prev_state = this._frame?.state;
    super.set_frame(v);
    const next_state = this._frame?.state;
    if (prev_state !== next_state && next_state !== void 0) {
      this.state = this.states.get(next_state) || this.states.get(Defines.State.Any);
    }
  }

  set state(v: BaseState | undefined) {
    if (this._state === v) return;
    this._state?.leave(this)
    this._state = v;
    this._state?.enter(this)
  }
  get state() { return this._state; }
  constructor(world: World, data: D, states: Map<number, BaseState>) {
    super(world, data)

    this.pictures.set('shadow', create_picture('shadow', simple_picture_info('shadow.png')).picture);
    this.states = states;
    const geometry = new THREE.PlaneGeometry(30, 15);
    const shadow_material = new THREE.MeshBasicMaterial({
      map: this.pictures.get('shadow')?.texture!,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    this.shadow = new THREE.Mesh(geometry, shadow_material);
    this.shadow.renderOrder = 0
    this.shadow.rotation.x = Math.PI * -0.5;
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

  update() {
    this.state?.update(this);
    this.on_after_state_update();

    if (this._next_frame) {
      this.enter_frame(this._next_frame);
      this._next_frame = void 0
    }
    if (!this._shaking && !this._motionless) this.position.add(this.velocity);

    if (this.position.y <= 0) {
      this.position.y = 0;
      if (this.velocity.y < 0) {
        this.velocity.y = 0;
        this.on_after_landing();
      }
    }
    const x = Math.floor(this.position.x)
    const y = Math.floor(this.position.y)
    const z = Math.floor(this.position.z)
    this.sprite.position.set(x, y, z)
    this.shadow.position.set(x, 1, z);
    if (this._motionless > 0) {
      --this._motionless;
    } else if (this._shaking > 0) {
      this.sprite.center.x += 4 * (this._shaking % 2 * 2 - 1) / this._piece.pw;
      --this._shaking;
    } else if (this.wait > 0) {
      --this.wait;
      this.v_rests.forEach((v, k, m) => { v > 1 ? m.set(k, v - 1) : m.delete(k) });
      this.a_rest > 1 ? this.a_rest-- : this.a_rest = 0;
    };



    this.on_after_update();
  }
  on_after_state_update(): void { }
  on_after_landing(): void { }
  on_after_update(): void { }


  on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    if (itr.arest) this.a_rest = itr.arest;
    else if (!itr.vrest) this.a_rest = this.wait + A_SHAKE + 2;
  }
  on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    if (!itr.arest && itr.vrest) this.v_rests.set(attacker.id, itr.vrest);
  }
  dispose(): void { }
}

