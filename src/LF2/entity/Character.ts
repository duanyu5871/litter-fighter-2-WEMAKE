import { Warn } from '../../Log';
import { constructor_name } from '../../common/constructor_name';
import { IBdyInfo, ICharacterData, ICharacterFrameInfo, ICharacterInfo, IFrameInfo, IItrInfo, INextFrame, IOpointInfo, TFace, TNextFrame } from '../../common/lf2_type';
import { Defines } from '../../common/lf2_type/defines';
import { factory } from '../Factory';
import type { World } from '../World';
import { ICube } from '../World';
import Callbacks, { NoEmitCallbacks } from '../base/Callbacks';
import { BaseController } from '../controller/BaseController';
import { InvalidController } from '../controller/InvalidController';
import { CHARACTER_STATES } from '../state/character';
import { Ball } from './Ball';
import { Entity, IEntityCallbacks } from './Entity';
import { Weapon } from './Weapon';
import { same_face, turn_face } from './face_helper';

export interface ICharacterCallbacks<E extends Character = Character> extends IEntityCallbacks<E> {
  on_dead?(e: E): void;
}

export class Character extends Entity<ICharacterFrameInfo, ICharacterInfo, ICharacterData> {
  static is = (v: any): v is Character => v?.is_character === true;
  readonly is_character = true
  protected _callbacks = new Callbacks<ICharacterCallbacks>()
  protected _controller: BaseController = new InvalidController(this);
  get callbacks(): NoEmitCallbacks<ICharacterCallbacks> {
    return this._callbacks
  }
  get controller() { return this._controller; }
  set controller(v) {
    if (this._controller === v) return;
    this._controller.dispose();
    this._controller = v;
  }
  protected _resting = 0;
  protected _fall_value = 70;
  protected _defend_value = 60;

  constructor(world: World, data: ICharacterData) {
    super(world, data, CHARACTER_STATES);
    this.mesh.name = Character.name + ':' + data.base.name;
    this.enter_frame({ id: Defines.FrameId.Auto });

    this._max_hp = this._hp = data.base.hp ?? Defines.HP;
    this._max_mp = this._mp = data.base.mp ?? Defines.MP;
    this._mp_r_min_spd = data.base.mp_r_min_spd ?? Defines.MP_RECOVERY_MIN_SPEED;
    this._mp_r_max_spd = data.base.mp_r_max_spd ?? Defines.MP_RECOVERY_MAX_SPEED;
    this.update_mp_recovery_speed();
  }

  override get_next_frame(which: string | TNextFrame): [ICharacterFrameInfo | undefined, INextFrame | undefined] {
    const ret = super.get_next_frame(which);
    if (ret[0]) {
      const frame = ret[0];
      const { hp = 0, mp = 0 } = frame;
      if (this._frame.next === which) {
        // 用next 进入此动作，负数表示消耗，无视正数。若消耗完毕跳至按下防御键的指定跳转动作
        if (mp < 0 && this._mp < -mp) return super.get_next_frame(frame.hit?.d ?? Defines.FrameId.Auto);
        if (hp < 0 && this._hp < -hp) return super.get_next_frame(frame.hit?.d ?? Defines.FrameId.Auto);
        if (mp < 0) this.mp += mp;
        if (hp < 0) this.hp += hp;
      } else {
        // 负数表示恢复，正数表示消耗。
        if (mp > 0 && this._mp < mp) return [void 0, void 0];
        if (hp > 0 && this._hp < hp) return [void 0, void 0];
        if (mp) this.mp -= mp
        if (hp) this.hp -= hp
      }
    }
    return ret;
  }


  override handle_facing_flag(facing: number, frame: IFrameInfo, flags: INextFrame): TFace {
    switch (facing) {
      case Defines.FacingFlag.ByController:
        return this.controller.LR || this.facing;
      case Defines.FacingFlag.SameAsCatcher:
        return this._catcher?.facing || this.facing;
      case Defines.FacingFlag.OpposingCatcher:
        return turn_face(this._catcher?.facing) || this.facing;
      default:
        return super.handle_facing_flag(facing, frame, flags);
    }
  }

  override find_auto_frame(): IFrameInfo {
    const { in_the_sky, standing, heavy_obj_walk } = this.data.indexes;
    let fid: string;
    if (this.weapon?.data.base.type === Defines.WeaponType.Heavy) fid = heavy_obj_walk[0]
    else if (this.position.y > 0) fid = in_the_sky[0]
    else if (this.hp > 0) fid = standing;
    else fid = standing; // TODO
    return this.data.frames[fid] ?? super.find_auto_frame();
  }
  override find_frame_by_id(id: string | undefined): ICharacterFrameInfo;
  override find_frame_by_id(id: string | undefined, exact: true): ICharacterFrameInfo | undefined;
  override find_frame_by_id(id: string | undefined, exact?: boolean): IFrameInfo | undefined {
    if (this.hp <= 0 && this.position.y <= 0 && this._frame.state === Defines.State.Lying) {
      const { lying } = this.data.indexes;
      const fid = this._frame.id;
      if (lying[-1] === fid) return super.find_frame_by_id(lying[-1])
      if (lying[1] === fid) return super.find_frame_by_id(lying[1])
    }
    return super.find_frame_by_id(id, exact as true);
  }
  override dispose() {
    this.controller.dispose();
    super.dispose()
  }

  on_landing() {
    const { indexes } = this.data;
    const f = this.get_frame();
    switch (f.state) {
      case 100: // 落雷霸
        this._next_frame = (f.next);
        break;
      case Defines.State.Frozen:
        if (this.velocity.y <= -4) {
          this._next_frame = ({ id: indexes.bouncing[this.facing] });
          return 2;
        }
        break;
      default:
        this._next_frame = ({ id: indexes.landing_2 });
        break;
    }
  }
  override handle_frame_velocity() {
    super.handle_frame_velocity();
    const { dvz } = this.get_frame();
    if (dvz !== void 0 && dvz !== 0 && dvz !== 550) {
      const { UD: UD1 } = this.controller;
      this.velocity.z = UD1 * dvz;
    }
  }
  override self_update(): void {
    super.self_update();
    switch (this._frame.state) {
      case Defines.State.Falling:
        this._resting = 0;
        this._fall_value = 70;
        this._defend_value = 60;
        break;
      default: {
        if (this._resting > 0) { this._resting--; }
        else {
          if (this._fall_value < 70) { this._fall_value += 0.5; }
          if (this._defend_value < 60) { this._defend_value += 0.5; }
        }
      }
    }
  }

  override get_sudden_death_frame(): TNextFrame {
    this.velocity.y = 2;
    this.velocity.x = 2 * this._facing;
    return { id: this.data.indexes.falling[1][1] }
  }

  override get_caught_end_frame(): TNextFrame {
    this.velocity.y = 2;
    this.velocity.x = -2 * this._facing;
    return { id: this.data.indexes.falling[-1][1] }
  }
  override on_after_update() {
    const next_frame_0 = this.controller.update();
    this._next_frame = next_frame_0 || this._next_frame;
  }

  private dizzy_catch_test(target: Entity) {
    return (this.velocity.x > 0 && target.position.x > this.position.x) ||
      (this.velocity.x < 0 && target.position.x < this.position.x)
  }
  private start_catch(target: Entity, itr: IItrInfo) {
    if (!Character.is(target)) {
      Warn.print(constructor_name(this), 'start_catch(), cannot catch', target)
      return;
    }
    if (itr.catchingact === void 0) {
      Warn.print(constructor_name(this), 'start_catch(), cannot catch, catchingact got', itr.catchingact)
      return;
    }
    this._catching_value = 602;
    this._catching = target;
    this._next_frame = itr.catchingact
  }
  private start_caught(attacker: Entity, itr: IItrInfo) {
    if (!Character.is(attacker)) {
      Warn.print(constructor_name(this), 'start_caught(), cannot be caught by', attacker)
      return
    }
    if (itr.caughtact === void 0) {
      Warn.print(constructor_name(this), 'start_caught(), cannot be caught, caughtact got', itr.caughtact)
      return;
    }
    this._catcher = attacker;
    this._resting = 0;
    this._fall_value = 70;
    this._defend_value = 50;
    this._next_frame = itr.caughtact;
  }
  override on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_collision(target, itr, bdy, a_cube, b_cube);
    switch (itr.kind) {
      case Defines.ItrKind.Catch:
        if (this.dizzy_catch_test(target))
          this.start_catch(target, itr);
        break;
      case Defines.ItrKind.ForceCatch: {
        this.start_catch(target, itr);
        break;
      }
      case Defines.ItrKind.Pick: {
        if (Weapon.is(target)) {
          if (target.data.base.type === Defines.WeaponType.Heavy) {
            this._next_frame = { id: this.data.indexes.picking_heavy }
          } else {
            this._next_frame = { id: this.data.indexes.picking_light }
          }
        }
        break;
      }
    }
  }
  override on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, r0: ICube, r1: ICube): void {
    super.on_be_collided(attacker, itr, bdy, r0, r1);

    if (itr.kind === Defines.ItrKind.SuperPunchMe) return;
    switch (itr.kind) {
      case Defines.ItrKind.Catch:
        if (Character.is(attacker) && attacker.dizzy_catch_test(this))
          this.start_caught(attacker, itr)
        return;
      case Defines.ItrKind.ForceCatch: {
        this.start_caught(attacker, itr)
        return;
      }
    }
    const spark_x = (Math.max(r0.left, r1.left) + Math.min(r0.right, r1.right)) / 2;
    const spark_y = (Math.min(r0.top, r1.top) + Math.max(r0.bottom, r1.bottom)) / 2;
    // const spark_z = (Math.min(r0.near, r1.near) + Math.max(r0.far, r1.far)) / 2;
    const spark_z = Math.max(r0.far, r1.far);

    const { indexes } = this.data;

    /** 攻击者朝向 */
    const aface = attacker.facing;

    /** 破防系数 */
    const bdefend = itr.bdefend || 0;

    this._resting = 30
    if (this.get_frame().state === Defines.State.Defend && aface !== this.facing && bdefend < 100) {
      this._defend_value -= bdefend;
      if (this._defend_value <= 0) { // 破防
        this._defend_value = 0;
        this.world.spark(spark_x, spark_y, spark_z, "broken_defend")
        this._next_frame = { id: indexes.broken_defend }
        return;
      }

      if (itr.dvx) this.velocity.x = itr.dvx * aface / 2;
      this.world.spark(spark_x, spark_y, spark_z, "defend_hit")
      this._next_frame = { id: indexes.defend_hit }
      return;
    }
    if (itr.injury) this.hp -= itr.injury
    this._defend_value = 0;
    this._fall_value -= itr.fall || 20;
    /* 击倒 */
    if (this._fall_value <= 0 || this._hp <= 0) {
      this._fall_value = 0;
      this.velocity.y = itr.dvy || 3;
      this.velocity.x = (itr.dvx || 0) * aface;
      if (
        itr.effect === Defines.ItrEffect.Fire ||
        itr.effect === Defines.ItrEffect.MFire1 ||
        itr.effect === Defines.ItrEffect.MFire2 ||
        itr.effect === Defines.ItrEffect.MFire3
      ) {
        // TODO: SOUND
        this._next_frame = { id: indexes.fire[0], facing: turn_face(attacker.facing) }
        return;
      } else if (itr.effect === Defines.ItrEffect.Ice) {
        // TODO: SOUND
        this._next_frame = { id: indexes.ice, facing: turn_face(attacker.facing) }
        return
      } else if (itr.effect === Defines.ItrEffect.Sharp) {
        this.world.spark(spark_x, spark_y, spark_z, "critical_bleed");
      } else {
        this.world.spark(spark_x, spark_y, spark_z, "critical_hit")
      }
      const direction = this.velocity.x / this.facing >= 0 ? 1 as const : -1 as const;
      this._next_frame = { id: indexes.critical_hit[direction][0] }
      return;
    }

    if (itr.dvx) this.velocity.x = itr.dvx * aface;

    if (
      itr.effect === Defines.ItrEffect.Fire ||
      itr.effect === Defines.ItrEffect.MFire1 ||
      itr.effect === Defines.ItrEffect.MFire2 ||
      itr.effect === Defines.ItrEffect.MFire3
    ) {
      // TODO: SOUND
      this._next_frame = { id: indexes.fire[0], facing: turn_face(attacker.facing) }
      return;
    } else if (itr.effect === Defines.ItrEffect.Ice) {
      // TODO: SOUND
      this._next_frame = { id: indexes.ice, facing: turn_face(attacker.facing) }
      return;
    } else if (itr.effect === Defines.ItrEffect.Sharp) {
      this.world.spark(spark_x, spark_y, spark_z, "bleed")
    } else {
      this.world.spark(spark_x, spark_y, spark_z, "hit")
    }

    /* 击晕 */
    if (this._fall_value <= 20) {
      this._next_frame = { id: indexes.dizzy };
      return;
    }
    /* 击中 */
    this._next_frame = { id: indexes.grand_injured[same_face(this, attacker)][0] }
  }

  override spawn_object(opoint: IOpointInfo, speed_z: number = 0) {
    const ret = super.spawn_object(opoint, speed_z);
    if (Ball.is(ret)) { ret.ud = this.controller.UD; }
    return ret;
  }

  on_lying_and_dead() {
    this._callbacks.emit('on_dead')(this);
  }
}

factory.set('character', (...args) => new Character(...args))