import * as THREE from 'three';
import { Log, Warn } from '../../Log';
import { constructor_name } from '../../js_utils/constructor_name';
import { IBdyInfo, ICharacterData, ICharacterFrameInfo, ICharacterInfo, IFrameInfo, IItrInfo, INextFrame, IOpointInfo, TFace, TNextFrame } from '../../js_utils/lf2_type';
import { Defines } from '../../js_utils/lf2_type/defines';
import { factory } from '../Factory';
import type { World } from '../World';
import { ICube } from '../World';
import { BaseController } from '../controller/BaseController';
import { InvalidController } from '../controller/InvalidController';
import { create_picture_by_img_key, image_pool } from '../loader/loader';
import { CHARACTER_STATES } from '../state/character';
import { Ball } from './Ball';
import { Entity, get_team_shadow_color, get_team_text_color } from './Entity';
import { Weapon } from './Weapon';
import { same_face, turn_face } from './face_helper';

export class Character extends Entity<ICharacterFrameInfo, ICharacterInfo, ICharacterData> {
  protected _controller: BaseController = new InvalidController(this);
  get controller() { return this._controller; }
  set controller(v) {
    if (this._controller === v) return;
    this._controller.dispose();
    this._controller = v;
  }
  protected _resting = 0;
  protected _fall_value = 70;
  protected _defend_value = 60;
  protected _name_sprite?: THREE.Sprite;
  get name_sprite() {
    return this._name_sprite
  }

  constructor(world: World, data: ICharacterData) {
    super(world, data, CHARACTER_STATES);
    this.enter_frame({ id: Defines.ReservedFrameId.Auto });
  }

  private update_name_sprite(name: string, team: number) {
    const fillStyle = get_team_text_color(team)
    const strokeStyle = get_team_shadow_color(team);
    if (!name) return;
    image_pool.load_text(name, { strokeStyle, fillStyle })
      .then((i) => create_picture_by_img_key('', i.key))
      .then((p) => {
        if (name !== this._name) return;
        if (team !== this._team) return;
        const material = new THREE.SpriteMaterial({ map: p.texture });
        if (!this._name_sprite) this._name_sprite = new THREE.Sprite(material);
        else this._name_sprite.material = material;
        this._name_sprite.scale.set(p.i_w, p.i_h, 1);
        this._name_sprite.center.set(0.5, 1.5);
        this.world.scene.add(this._name_sprite);
      });
  }

  protected override on_name_changed(value: string, prev: string): void {
    this.update_name_sprite(value, this._team);
  }
  protected override on_team_changed(value: number, prev: number): void {
    this.update_name_sprite(this._name, value);
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
    this.name_sprite?.removeFromParent()
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
    const { UD: UD1 } = this.controller;
    if (dvz !== void 0 && dvz !== 0) this.velocity.z = UD1 * dvz;
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
        if (target instanceof Weapon) {
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
    Log.print(constructor_name(this), 'on_be_collided()', attacker, itr, bdy)
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

  override spawn_object(opoint: IOpointInfo, speed_z: number = 0) {
    const ret = super.spawn_object(opoint, speed_z);
    if (ret instanceof Ball) { ret.ud = this.controller.UD; }
    return ret;
  }
}

factory.set('character', (...args) => new Character(...args))