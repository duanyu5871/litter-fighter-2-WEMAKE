import { CHARACTER_STATES } from '../State';
import { Defines } from '../defines';
import { IBdyInfo, ICharacterData, IFrameInfo, IItrInfo, INextFrameFlags } from '../js_utils/lf2_type';
import { A_SHAKE, V_SHAKE, Entity } from './Entity';
import { InvalidController } from './InvalidController';
import type { World } from './World';
import { ICube } from './World';

export class Character extends Entity<ICharacterData> {
  protected _disposers: (() => void)[] = [];
  controller: IController<Character> = new InvalidController(this);
  protected _resting = 0;
  protected fall_value = 70;
  protected defend_value = 60;

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
    if (!prev) return;
    if (!curr) return;
    if (this.position.y !== 0) return;
    if (!Array.isArray(prev.next) && prev.next.id === 'auto') {
      this.controller._next_punch_ready = 1;
    }
    if (curr.state !== 3) {
      this.controller._next_punch_ready = 0;
    }
  }
  check_leniency_hit_a() {
    if (!this.controller._need_punch) return;
    this.controller._need_punch = 0;
    const f = this.get_frame();
    if (f.hit?.a) this.enter_frame(f.hit?.a);

  }
  override on_after_landing() {
    const { indexes } = this.data.base;
    const f = this.get_frame();
    switch (f.state) {
      case 100: // 落雷霸
        this.enter_frame(f.next);
        break;
      case Defines.State.Jump:
        this.enter_frame({ id: indexes.landing_1 });
        break;
      case Defines.State.Falling:
        // eslint-disable-next-line eqeqeq
        const a = indexes.falling[-1].find(v => v == f.id);
        this.enter_frame({ id: indexes.lying[a !== void 0 ? -1 : 1] });
        break;
      default:
        this.enter_frame({ id: indexes.landing_2 });
    }
  }
  override on_after_update() {
    switch (this.get_frame().state) {
      case Defines.State.Defend:
      case Defines.State.Injured:
        this._resting = 20;
        break;
      case Defines.State.Tired:
        break;
      case Defines.State.Falling:
        this.fall_value = 70;
        this.defend_value = 60;
        break;
      default: {
        if (this._resting > 0) { this._resting--; break; }
        if (this.fall_value < 70) { this.fall_value += 1; }
        if (this.defend_value < 60) { this.defend_value += 1; }
      }
    }
  }
  override on_after_state_update(): void {
    const nf = this.controller.update();
    if (nf) this.enter_frame(nf);
  }
  override handle_frame_velocity() {
    super.handle_frame_velocity();
    const { dvz } = this.get_frame();
    const { UD1 } = this.controller;
    if (dvz !== void 0 && dvz !== 0) this.velocity.z = UD1 * dvz;
  }
  override on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_collision(target, itr, bdy, a_cube, b_cube);
    if (!this._motionless) this._motionless += A_SHAKE;
  }

  override on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, r0: ICube, r1: ICube): void {
    super.on_be_collided(attacker, itr, bdy, r0, r1);

    const spark_x = (Math.max(r0.left, r1.left) + Math.min(r0.right, r1.right)) / 2;
    const spark_y = (Math.min(r0.top, r1.top) + Math.max(r0.bottom, r1.bottom)) / 2;
    // const spark_z = (Math.min(r0.near, r1.near) + Math.max(r0.far, r1.far)) / 2;
    const spark_z = Math.max(r0.far, r1.far);

    // console.log(spark_x, spark_y, spark_z)
    const { indexes } = this.data.base;

    /** 攻击者朝向 */
    const aface = attacker.face;

    /** 破防系数 */
    const bdefend = itr.bdefend || 0;

    if (this.get_frame().state === Defines.State.Defend && aface !== this.face && bdefend < 100) {
      this.defend_value -= bdefend;

      if (this.defend_value <= 0) { // 破防
        this.defend_value = 0;
        this._shaking = V_SHAKE;
        this.world.spark(spark_x, spark_y, spark_z, "broken_defend")
        this.enter_frame({ id: indexes.broken_defend })
        this._next_frame = void 0;
        return;
      }

      if (itr.dvx) this.velocity.x = itr.dvx * aface / 2;
      this._shaking = V_SHAKE;
      this.world.spark(spark_x, spark_y, spark_z, "defend_hit")
      this.enter_frame({ id: indexes.defend_hit })
      this._next_frame = void 0;
      return;
    }

    this.defend_value = 0;
    this.fall_value -= itr.fall || 20;
    /* 击倒 */
    if (this.fall_value <= 0) {
      this.fall_value = 0;

      const { x: vx, y: vy } = this.velocity;
      const dvy = itr.dvy ?? 5;
      if ((dvy < 0 && vy > dvy) || (dvy > 0 && vy < dvy))
        this.velocity.y = dvy;
      else
        this.velocity.y += dvy;

      if (itr.dvx) {
        const dvx = itr.dvx * aface
        if ((dvx < 0 && vx > dvx) || (dvx > 0 && vx < dvx))
          this.velocity.x = dvx;
        else
          this.velocity.x += dvx / 2;
      }

      this._shaking = V_SHAKE * 2;
      if (itr.effect === 1) {
        this.world.spark(spark_x, spark_y, spark_z, "critical_bleed");
      } else {
        this.world.spark(spark_x, spark_y, spark_z, "critical_hit")
      }
      this.enter_frame({ id: indexes.falling[aface][0] })
      this._next_frame = void 0;
      return;
    }

    this._shaking = V_SHAKE;
    if (itr.effect === 1) {
      this.world.spark(spark_x, spark_y, spark_z, "bleed")
    } else {
      this.world.spark(spark_x, spark_y, spark_z, "hit")
    }

    if (itr.dvx) this.velocity.x = itr.dvx * aface;

    /* 击晕 */
    if (this.fall_value <= 20) {
      this.enter_frame({ id: indexes.dizzy });
      this._next_frame = void 0;
      return;
    }


    /* 击中 */
    this.enter_frame({ id: indexes.grand_injured[this.face * aface as -1 | 1][0] })
    this._next_frame = void 0;
  }
}
