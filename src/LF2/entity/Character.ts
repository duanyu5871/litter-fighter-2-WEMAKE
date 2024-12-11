import { Warn } from '../../Log';
import { type ICube, type World } from '../World';
import type { IBdyInfo, ICharacterData, ICharacterFrameInfo, ICharacterInfo, IFrameInfo, IItrInfo, INextFrame, IOpointInfo, TFace, TNextFrame } from '../defines';
import { Defines } from '../defines/defines';
import { CHARACTER_STATES } from '../state/character';
import Entity from './Entity';
import { Factory } from './Factory';
import { same_face, turn_face } from './face_helper';
import { is_ball, is_character, is_weapon } from './type_check';

export default class Character extends Entity<ICharacterFrameInfo, ICharacterInfo, ICharacterData> {
  static override readonly TAG: string = 'Character';
  readonly is_character = true;
  protected _resting = 0;
  constructor(world: World, data: ICharacterData) {
    super(world, data, CHARACTER_STATES);
    this.name = Character.name + ':' + data.base.name;
    this.enter_frame({ id: Defines.FrameId.Auto });

    this._max_hp = data.base.hp ?? Defines.DAFUALT_HP;
    this._max_mp = data.base.mp ?? Defines.DAFAULT_MP;
    this._mp_r_min_spd = data.base.mp_r_min_spd ?? Defines.DAFAULT_MP_RECOVERY_MIN_SPEED;
    this._mp_r_max_spd = data.base.mp_r_max_spd ?? Defines.DAFAULT_MP_RECOVERY_MAX_SPEED;
    this._max_catch_time = data.base.catch_time ?? Defines.DAFUALT_CATCH_TIME;

    this.update_mp_recovery_speed();

    this.fall_value = this.data.base.fall_value;
    this.defend_value = this.data.base.defend_value;
    this._hp = this._max_hp
    this._mp = this._max_mp
    this._catch_time = this._max_catch_time;
  }

  override get_next_frame(which: string | TNextFrame): [ICharacterFrameInfo | undefined, INextFrame | undefined] {
    const ret = super.get_next_frame(which);
    if (!ret[0]) return ret

    if (this.world.lf2.infinity_mp) return ret;

    const [frame] = ret;
    const { hp = 0, mp = 0 } = frame;

    if (this.frame.next === which) {
      // 用next 进入此动作，负数表示消耗，无视正数。若消耗完毕跳至按下防御键的指定跳转动作
      if (mp < 0 && this._mp < -mp) return super.get_next_frame(frame.hit?.d ?? Defines.FrameId.Auto);
      if (hp < 0 && this._hp < -hp) return super.get_next_frame(frame.hit?.d ?? Defines.FrameId.Auto);
    } else {
      if (mp > 0 && this._mp < mp) return [void 0, void 0];
      if (hp > 0 && this._hp < hp) return [void 0, void 0];
    }
    return ret;
  }

  override handle_facing_flag(facing: number, frame: IFrameInfo): TFace {
    switch (facing) {
      case Defines.FacingFlag.ByController:
        return this.controller?.LR || this.facing;
      case Defines.FacingFlag.SameAsCatcher:
        return this._catcher?.facing || this.facing;
      case Defines.FacingFlag.OpposingCatcher:
        return turn_face(this._catcher?.facing) || this.facing;
      default:
        return super.handle_facing_flag(facing, frame);
    }
  }

  override self_update(): void {
    super.self_update();
    switch (this.frame.state) {
      case Defines.State.Lying:
        this._resting = 0;
        this.fall_value = this.data.base.fall_value;
        this.defend_value = this.data.base.defend_value;
        break;
      case Defines.State.Burning:
        break;
      default: {
        if (this._resting > 0) { this._resting--; }
        else {
          if (this.fall_value < this.data.base.fall_value) { this.fall_value += 1; }
          if (this.defend_value < this.data.base.defend_value) { this.defend_value += 1; }
        }
      }
    }
  }

  override get_sudden_death_frame(): TNextFrame {
    this.velocity.y = 2;
    this.velocity.x = 2 * this.facing;
    return { id: this.data.indexes.falling[1][1] }
  }

  override get_caught_end_frame(): TNextFrame {
    this.velocity.y = 2;
    this.velocity.x = -2 * this.facing;
    return { id: this.data.indexes.falling[-1][1] }
  }

  private dizzy_catch_test(target: Entity) {
    return (this.velocity.x > 0 && target.position.x > this.position.x) ||
      (this.velocity.x < 0 && target.position.x < this.position.x)
  }
  private start_catch(target: Entity, itr: IItrInfo) {
    if (!is_character(target)) {
      Warn.print(Character.TAG + '::start_catch', 'cannot catch', target)
      return;
    }
    if (itr.catchingact === void 0) {
      Warn.print(Character.TAG + '::start_catch', 'cannot catch, catchingact got', itr.catchingact)
      return;
    }
    this._catch_time = this._max_catch_time;
    this._catching = target;
    this._next_frame = itr.catchingact
  }
  private start_caught(attacker: Entity, itr: IItrInfo) {
    if (!is_character(attacker)) {
      Warn.print(Character.TAG + '::start_caught', 'cannot be caught by', attacker)
      return
    }
    if (itr.caughtact === void 0) {
      Warn.print(Character.TAG + '::start_caught', 'cannot be caught, caughtact got', itr.caughtact)
      return;
    }
    this._catcher = attacker;
    this._resting = 0;
    this.fall_value = this.data.base.fall_value;
    this.defend_value = this.data.base.defend_value;
    this._next_frame = itr.caughtact;
  }
  override on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {

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
        if (!is_weapon(target)) return;
        if (target.data.base.type === Defines.WeaponType.Heavy) {
          this._next_frame = { id: this.data.indexes.picking_heavy }
        } else {
          this._next_frame = { id: this.data.indexes.picking_light }
        }
        break;
      }
      case Defines.ItrKind.PickSecretly:
        // do nothing
        break;
      default: {
        super.on_collision(target, itr, bdy, a_cube, b_cube);
      }
    }
  }
  override on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, r0: ICube, r1: ICube): void {
    if (itr.kind === Defines.ItrKind.Heal) {
      // TODO:
      return;
    }
    super.on_be_collided(attacker, itr, bdy, r0, r1);

    if (itr.kind === Defines.ItrKind.SuperPunchMe) return;
    switch (itr.kind) {
      case Defines.ItrKind.Catch:
        if (is_character(attacker) && attacker.dizzy_catch_test(this))
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
    const spark_z = Math.max(r0.near, r1.near);

    const { indexes } = this.data;

    /** 攻击者朝向 */
    const aface = attacker.facing;

    /** 破防系数 */
    const bdefend = itr.bdefend || 0;

    this._resting = 30
    if (
      this.frame.state === Defines.State.Defend &&
      aface !== this.facing &&
      bdefend < 100
    ) {
      this.defend_value -= 2 * bdefend;
      if (this.defend_value <= 0) { // 破防
        this.defend_value = 0;
        this.world.spark(spark_x, spark_y, spark_z, "broken_defend")
        this._next_frame = { id: indexes.broken_defend }
        return;
      }

      if (itr.dvx) {
        this.velocity.x = itr.dvx * aface / 2;
      }
      this.world.spark(spark_x, spark_y, spark_z, "defend_hit")
      this._next_frame = { id: indexes.defend_hit }
      return;
    }
    if (itr.injury) {
      this.hp -= itr.injury;
      attacker.add_damage_sum(itr.injury);
      if (this.hp <= 0) attacker.add_kill_sum(1);
    }

    this.defend_value = 0;
    this.fall_value -= itr.fall ? itr.fall * 2 : 40;
    /* 击倒 */
    if (
      this.fall_value <= 0 ||
      this._hp <= 0 || (
        this.fall_value <= 40 && (
          this.velocity.y > 0 ||
          this.position.y > 0
        )
      )
    ) {
      this.fall_value = 0;
      this.velocity.y = itr.dvy ?? 3;

      if (itr.dvx) {
        switch (itr.effect) {
          case Defines.ItrEffect.FireExplosion:
          case Defines.ItrEffect.Explosion: {
            const direction = this.position.x > attacker.position.x ? -1 : 1
            this.velocity.x = itr.dvx * direction;
            break;
          }
          default: {
            this.velocity.x = itr.dvx * aface;
            break;
          }
        }
      }

      if (
        itr.effect === Defines.ItrEffect.Fire ||
        itr.effect === Defines.ItrEffect.MFire1 ||
        itr.effect === Defines.ItrEffect.MFire2 ||
        itr.effect === Defines.ItrEffect.FireExplosion
      ) {
        // TODO: SOUND
        this.fall_value = 0;
        this.defend_value = 0;
        this._next_frame = { id: indexes.fire[0], facing: turn_face(attacker.facing) }
        return;
      } else if (itr.effect === Defines.ItrEffect.Ice) {
        // TODO: SOUND
        this.fall_value = 0;
        this.defend_value = 0;
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
      itr.effect === Defines.ItrEffect.FireExplosion
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
    if (this.fall_value <= 40) {
      this._next_frame = { id: indexes.dizzy };
      return;
    }
    /* 击中 */
    this._next_frame = { id: indexes.grand_injured[same_face(this, attacker)][0] }
  }

  override spawn_entity(opoint: IOpointInfo, speed_z: number = 0) {
    const ret = super.spawn_entity(opoint, speed_z);
    if (this.controller) {
      if (is_ball(ret)) {
        // ret.ud = this.controller.UD;
      }
    }
    return ret;
  }

  on_dead() {
    this._callbacks.emit('on_dead')(this);
  }
}
Factory.inst.set('character', (...args) => new Character(...args));