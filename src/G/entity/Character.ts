import * as THREE from 'three';
import { constructor_name } from '../../js_utils/constructor_name';
import { is_nagtive_num } from '../../js_utils/is_nagtive_num';
import { IBdyInfo, ICharacterData, ICharacterFrameInfo, ICharacterInfo, IFrameInfo, IItrInfo, INextFrame, IOpointInfo, TNextFrame } from '../../js_utils/lf2_type';
import { Defines } from '../../js_utils/lf2_type/defines';
import { factory } from '../Factory';
import type { World } from '../World';
import { ICube } from '../World';
import { IController } from '../controller/IController';
import { InvalidController } from '../controller/InvalidController';
import { create_picture_by_img_key, image_pool } from '../loader/loader';
import { CHARACTER_STATES } from '../state/character';
import { Ball } from './Ball';
import { Entity, V_SHAKE } from './Entity';
import { same_face, turn_face } from './face_helper';
export class Character extends Entity<ICharacterFrameInfo, ICharacterInfo, ICharacterData> {
  protected _disposers: (() => void)[] = [];
  controller: IController<Character> = new InvalidController(this);
  protected _resting = 0;
  protected _fall_value = 70;
  protected _defend_value = 60;

  /** 
   * 抓人剩余值
   * 
   * 当抓住一个被击晕的人时，此值充满。
   */
  protected _catching_value = 602;

  protected _catching?: Character;
  protected _catcher?: Character;
  protected _name_sprite?: THREE.Sprite;
  get name_sprite() { return this._name_sprite }

  constructor(world: World, data: ICharacterData) {
    super(world, data, CHARACTER_STATES);
    this.enter_frame({ id: Defines.ReservedFrameId.Auto });

    image_pool.load_text(data.base.name, data.base.name).then((i) => {
      return create_picture_by_img_key('', i.key)
    }).then((p) => {
      const material = new THREE.SpriteMaterial({ map: p.texture });
      const text_sprite = this._name_sprite = new THREE.Sprite(material);
      text_sprite.scale.set(p.i_w, p.i_h, 1)
      text_sprite.center.set(0.5, 1.5);
      world.scene.add(text_sprite);
    })
  }


  override handle_facing_flag(facing: number, frame: IFrameInfo, flags: INextFrame): void {
    switch (facing) {
      case Defines.FacingFlag.ByController:
        this.facing = this.controller.LR1 || this.facing;
        break;
      case Defines.FacingFlag.SameAsCatcher:
        this.facing = this._catcher?._facing || this.facing;
        break;
      case Defines.FacingFlag.OpposingCatcher:
        this.facing = turn_face(this._catcher?._facing) || this.facing;
        break;
      default:
        super.handle_facing_flag(facing, frame, flags);
        break;
    }
  }
  override find_auto_frame(): IFrameInfo {
    const { in_the_air, standing } = this.data.base.indexes;
    const fid = this.position.y ? in_the_air[0] : standing;
    // Log.print(constructor_name(this), 'find_auto_frame(), this.position.y:', this.position.y)
    return this.data.frames[fid] ?? super.find_auto_frame();
  }

  override dispose() {
    this.controller.dispose();
    this._disposers.forEach(f => f());
    this.world.del_entities(this);
  }

  on_landing() {
    const { indexes } = this.data.base;
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
    const { UD1 } = this.controller;
    if (dvz !== void 0 && dvz !== 0) this.velocity.z = UD1 * dvz;
  }
  override self_update(): void {
    super.self_update();

    const { cpoint } = this._frame;
    if (cpoint && is_nagtive_num(cpoint.decrease)) {
      this._catching_value += cpoint.decrease;
      if (this._catching_value < 0) this._catching_value = 0;
    }

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
  override on_after_update() {
    const next_frame_0 = this.controller.update();
    const next_frame_1 = this.update_catching();
    const next_frame_2 = this.update_caught();
    this._next_frame = next_frame_2 || next_frame_1 || next_frame_0 || this._next_frame;
  }
  update_caught(): TNextFrame | undefined {
    if (!this._catcher) return;

    if (!this._catcher._catching_value) {
      delete this._catcher;
      this.velocity.y = 3;
      this.velocity.x = -2 * this._facing;
      return { id: this.data.base.indexes.falling[-1] }
    }

    const { cpoint: cpoint_a } = this._catcher._frame;
    const { cpoint: cpoint_b } = this._frame;

    if (!cpoint_a || !cpoint_b) {
      delete this._catcher;
      Log.print(constructor_name(this), 'update_caught(), loose!')
      if (this.position.y < 1) this.position.y = 1;
      return { id: 'auto' }
    }
    if (cpoint_a.injury) this.hp += cpoint_a.injury;
    if (cpoint_a.shaking) this._shaking = V_SHAKE;

    const { throwvx, throwvy, throwvz } = cpoint_a;
    if (throwvx) this.velocity.x = throwvx * this.facing;
    if (throwvy) this.velocity.y = throwvy;
    if (throwvz) this.velocity.z = throwvz * this._catcher.controller.UD1;
    if (throwvx || throwvy || throwvz) {
      delete this._catcher;
    }
    if (cpoint_a.vaction) return cpoint_a.vaction;
  }

  update_catching(): TNextFrame | undefined {
    if (!this._catching) return;

    if (!this._catching_value) {
      delete this._catching;
      return { id: 'auto' };
    }

    const { cpoint: cpoint_a } = this._frame;
    const { cpoint: cpoint_b } = this._catching._frame;
    if (!cpoint_a || !cpoint_b) {
      if (this.position.y < 0) this.position.y = 0;
      delete this._catching;
      return { id: 'auto' };
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

  override update_sprite_position() {
    super.update_sprite_position();
    if (this._name_sprite) {
      const { x, z } = this.position;
      this._name_sprite.position.set(x, - z / 2, z)
      this.world.restrict(this._name_sprite);
    }
  }
  private dizzy_catch_test(target: Entity) {
    return (this.velocity.x > 0 && target.position.x > this.position.x) ||
      (this.velocity.x < 0 && target.position.x < this.position.x)
  }
  private start_catch(target: Entity, itr: IItrInfo) {
    if (!(target instanceof Character)) {
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
    if (!(attacker instanceof Character)) {
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
    if (target instanceof Character) {
      if (target._catcher?.get_frame().cpoint?.hurtable === 0) return;
    }
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
    }
  }
  override on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, r0: ICube, r1: ICube): void {
    Log.print(constructor_name(this), 'on_be_collided()', attacker, itr, bdy)
    if (this._catcher?.get_frame().cpoint?.hurtable === 0) return;
    super.on_be_collided(attacker, itr, bdy, r0, r1);
    if (itr.kind === Defines.ItrKind.SuperPunchMe) return;
    switch (itr.kind) {
      case Defines.ItrKind.Catch:
        if (attacker instanceof Character && attacker.dizzy_catch_test(this))
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

    const { indexes } = this.data.base;

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

    this._defend_value = 0;
    this._fall_value -= itr.fall || 20;
    /* 击倒 */
    if (this._fall_value <= 0) {
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

  override spawn_object(opoint: IOpointInfo) {
    const ret = super.spawn_object(opoint);
    if (ret instanceof Ball) { ret.ud = this.controller.UD1; }
    return ret;
  }
}

factory.set('character', (...args) => new Character(...args))