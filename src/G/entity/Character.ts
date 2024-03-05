import { IBdyInfo, ICharacterData, IFrameInfo, IItrInfo, INextFrameFlags, TFace } from '../../js_utils/lf2_type';
import { Defines } from '../../js_utils/lf2_type/defines';
import { factory } from '../Factory';
import type { World } from '../World';
import { ICube } from '../World';
import { IController } from '../controller/IController';
import { InvalidController } from '../controller/InvalidController';
import { CHARACTER_STATES } from '../state/CharacterState';
import { Entity } from './Entity';
import find_direction from './find_frame_direction';
import { different_face_flags, same_face, same_face_flags, turn_face } from './new_frame_flags';

export class Character extends Entity<ICharacterData> {
  protected _disposers: (() => void)[] = [];
  controller: IController<Character> = new InvalidController(this);
  protected _resting = 0;
  protected _fall_value = 70;
  protected _defend_value = 60;
  protected _catching?: Character

  override handle_next_frame_flags(flags: INextFrameFlags | undefined): void {
    switch (flags?.turn) {
      case 2:
        this._face = this.controller.LR1 || this._face;
        break;
      default: super.handle_next_frame_flags(flags);
    }
  }
  override find_auto_frame(): IFrameInfo {
    const { in_the_air, standing } = this.data.base.indexes;
    const fid = this.position.y ? in_the_air[0] : standing;
    return this.data.frames[fid] ?? super.find_auto_frame();
  }

  constructor(world: World, data: ICharacterData) {
    super(world, data, CHARACTER_STATES);
    this.enter_frame({ id: 'auto' });
  }

  override dispose() {
    this.controller.dispose();
    this._disposers.forEach(f => f());
    this.world.remove_entities(this);
  }

  setup_leniency_hit_a(prev: IFrameInfo | void, curr: IFrameInfo | void) {
    if (!prev || !curr || this.position.y !== 0) return;
    if (!Array.isArray(prev.next) && prev.next.id === 'auto') {
      this.controller._next_punch_ready = 1;
    }
    if (curr.state !== Defines.State.Attacking) {
      this.controller._next_punch_ready = 0;
    }
  }
  override on_landing() {
    const { indexes } = this.data.base;
    const f = this.get_frame();
    switch (f.state) {
      case 100: // 落雷霸
        this.enter_frame(f.next);
        break;
      case Defines.State.Jump:
        this.enter_frame({ id: indexes.landing_1 });
        break;
      case Defines.State.Flame:
      case Defines.State.Falling:
        // eslint-disable-next-line eqeqeq
        const d =
          find_direction(f, indexes.bouncing) ||
          find_direction(f, indexes.falling) ||
          find_direction(f, indexes.critical_hit) || this.face
        if (this.velocity.y <= -4) {
          this.enter_frame({ id: indexes.bouncing[d] });
          return 2;
        }
        this.enter_frame({ id: indexes.lying[d] });
        break;
      case Defines.State.Frozen:
        if (this.velocity.y <= -4) {
          this.enter_frame({ id: indexes.bouncing[this.face] });
          return 2;
        }
        break;
      default:
        this.enter_frame({ id: indexes.landing_2 });
    }
  }
  override on_after_update() {
    const { state, cpoint } = this.get_frame();
    if (cpoint && cpoint.kind === Defines.CPointKind.Attacker) {
      Log.print('App', cpoint);
    }
    switch (state) {
      case Defines.State.Defend:
      case Defines.State.Injured:
        this._resting = 10;
        break;
      case Defines.State.Tired:
        this._resting = 0;
        break;
      case Defines.State.Falling:
        this._resting = 0;
        this._fall_value = 70;
        this._defend_value = 60;
        break;
      default: {
        if (this._resting > 0) { this._resting--; break; }
        if (this._fall_value < 70) { this._fall_value += 1; }
        if (this._defend_value < 60) { this._defend_value += 1; }
      }
    }
  }
  override on_after_state_update(): void {
    this.update_catching();
    this._next_frame = this.controller.update();
  }
  override handle_frame_velocity() {
    super.handle_frame_velocity();
    const { dvz } = this.get_frame();
    const { UD1 } = this.controller;
    if (dvz !== void 0 && dvz !== 0) this.velocity.z = UD1 * dvz;
  }

  update_catching(): void {
    if (!this._catching) return;
    const { cpoint: cpoint_a, pic, centerx: centerx_a, centery: centery_a } = this.get_frame();
    if (typeof pic === 'number') return;

    const { cpoint: cpoint_b, centerx: centerx_b, centery: centery_b } = this._catching.get_frame();
    if (!cpoint_a || !cpoint_b) { delete this._catching; return; }

    if (cpoint_a.vaction) {
      this._catching.face = cpoint_a.dircontrol === -1 ? turn_face(this.face) : this.face;
      this._catching.enter_frame({ id: cpoint_a.vaction });
    }
    if (cpoint_a.injury) {
      this._catching.hp += cpoint_a.injury;
    }
    const { throwvx, throwvy, throwvz, x: catch_x, y: catch_y, cover } = cpoint_a;
    const { x: caught_x, y: caught_y } = cpoint_b;

    if (throwvx) this._catching.velocity.x = throwvx * this.face;
    if (throwvy) this._catching.velocity.y = throwvy;
    if (throwvz) this._catching.velocity.z = throwvz * this.controller.UD1;

    const face_a = this.face;
    const face_b = this._catching.face;
    const { x: px, y: py, z: pz } = this.position;
    this._catching.position.x = px - face_a * (centerx_a - catch_x) + face_b * (centerx_b - caught_x);
    this._catching.position.y = py + centery_a - catch_y - centery_b + caught_y;
    this._catching.position.z = pz;
    if (cover === 11) this._catching.position.z += 1;
    else if (cover === 10) this._catching.position.z -= 1;
    this._catching.update_sprite_position();
    Log.print('Charactor', 'update_catching(),', cpoint_a);
  }

  override on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_collision(target, itr, bdy, a_cube, b_cube);

    switch (itr.kind) {
      case Defines.ItrKind.Catch:
      case Defines.ItrKind.ForceCatch: {
        if (target instanceof Character && itr.catchingact !== void 0) {
          delete this._next_frame;
          this.enter_frame({ id: itr.catchingact });
          this._catching = target;
        }
        return;
      }
    }
  }

  override on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, r0: ICube, r1: ICube): void {
    super.on_be_collided(attacker, itr, bdy, r0, r1);
    if (itr.kind === Defines.ItrKind.SuperPunchMe) return;

    switch (itr.kind) {
      case Defines.ItrKind.Catch:
      case Defines.ItrKind.ForceCatch: {
        if (itr.caughtact !== void 0) {
          this.enter_frame({ id: itr.caughtact, flags: same_face_flags(attacker, this) })
          delete this._next_frame;
        }
        return;
      }
    }

    Log.print('App', "on_be_collided, itr:", itr, bdy, this.get_frame());
    const spark_x = (Math.max(r0.left, r1.left) + Math.min(r0.right, r1.right)) / 2;
    const spark_y = (Math.min(r0.top, r1.top) + Math.max(r0.bottom, r1.bottom)) / 2;
    // const spark_z = (Math.min(r0.near, r1.near) + Math.max(r0.far, r1.far)) / 2;
    const spark_z = Math.max(r0.far, r1.far);

    const { indexes } = this.data.base;

    /** 攻击者朝向 */
    const aface = attacker.face;

    /** 破防系数 */
    const bdefend = itr.bdefend || 0;

    if (this.get_frame().state === Defines.State.Defend && aface !== this.face && bdefend < 100) {
      this._defend_value -= bdefend;
      if (this._defend_value <= 0) { // 破防
        this._defend_value = 0;
        this.world.spark(spark_x, spark_y, spark_z, "broken_defend")
        this.enter_frame({ id: indexes.broken_defend })
        this._next_frame = void 0;
        return;
      }

      if (itr.dvx) this.velocity.x = itr.dvx * aface / 2;
      this.world.spark(spark_x, spark_y, spark_z, "defend_hit")
      this.enter_frame({ id: indexes.defend_hit })
      this._next_frame = void 0;
      return;
    }

    this._defend_value = 0;
    this._fall_value -= itr.fall || 20;
    /* 击倒 */
    if (this._fall_value <= 0) {
      this._fall_value = 0;
      this.velocity.y = itr.dvy || 3;
      this.velocity.x = (itr.dvx || 0) * aface;

      let f = this.face * aface as TFace;
      if (itr?.dvx && itr.dvx < 0) f = turn_face(f);

      if (
        itr.effect === Defines.ItrEffect.Fire ||
        itr.effect === Defines.ItrEffect.MFire1 ||
        itr.effect === Defines.ItrEffect.MFire2 ||
        itr.effect === Defines.ItrEffect.MFire3
      ) {
        // TODO: SOUND
        this.enter_frame({ id: indexes.fire[0], flags: different_face_flags(attacker, this) })
        this._next_frame = void 0;
        return;
      } else if (itr.effect === Defines.ItrEffect.Ice) {
        // TODO: SOUND
        this.enter_frame({ id: indexes.ice, flags: different_face_flags(attacker, this) })
        this._next_frame = void 0;
        return;
      } else if (itr.effect === Defines.ItrEffect.Sharp) {
        this.world.spark(spark_x, spark_y, spark_z, "critical_bleed");
      } else {
        this.world.spark(spark_x, spark_y, spark_z, "critical_hit")
      }
      this.enter_frame({ id: indexes.critical_hit[f][0] })
      this._next_frame = void 0;
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
      this.enter_frame({ id: indexes.fire[0], flags: different_face_flags(attacker, this) })
      this._next_frame = void 0;
      return;
    } else if (itr.effect === Defines.ItrEffect.Ice) {
      // TODO: SOUND
      this.enter_frame({ id: indexes.ice, flags: different_face_flags(attacker, this) })
      this._next_frame = void 0;
      return;
    } else if (itr.effect === Defines.ItrEffect.Sharp) {
      this.world.spark(spark_x, spark_y, spark_z, "bleed")
    } else {
      this.world.spark(spark_x, spark_y, spark_z, "hit")
    }

    /* 击晕 */
    if (this._fall_value <= 20) {
      this.enter_frame({ id: indexes.dizzy });
      this._next_frame = void 0;
      return;
    }
    /* 击中 */
    this.enter_frame({ id: indexes.grand_injured[same_face(this, attacker)][0] })
    this._next_frame = void 0;
  }
}

factory.set('character', (...args) => new Character(...args))