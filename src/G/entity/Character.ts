import * as THREE from 'three';
import { IBdyInfo, ICharacterData, ICharacterInfo, IFrameInfo, IItrInfo, INextFrame, IOpointInfo, TFace, TNextFrame } from '../../js_utils/lf2_type';
import { Defines } from '../../js_utils/lf2_type/defines';
import { factory } from '../Factory';
import type { World } from '../World';
import { ICube } from '../World';
import { IController } from '../controller/IController';
import { InvalidController } from '../controller/InvalidController';
import { create_picture_by_img_key, image_pool } from '../loader/loader';
import { CHARACTER_STATES } from '../state/CharacterState';
import { Ball } from './Ball';
import { Entity, V_SHAKE } from './Entity';
import find_direction from './find_frame_direction';
import { same_face, turn_face } from './face_helper';
export class Character extends Entity<IFrameInfo, ICharacterInfo, ICharacterData> {
  protected _disposers: (() => void)[] = [];
  controller: IController<Character> = new InvalidController(this);
  protected _resting = 0;
  protected _fall_value = 70;
  protected _defend_value = 60;
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


  override handle_turn_flag(turn: number, frame: IFrameInfo, flags: INextFrame): void {
    switch (turn) {
      case Defines.TurnFlag.ByController:
        this._face = this.controller.LR1 || this._face;
        break;
      case Defines.TurnFlag.SameAsCatcher:
        this._face = this._catcher?._face || this._face;
        break;
      case Defines.TurnFlag.OpposingCatcher:
        this._face = turn_face(this._catcher?._face) || this._face;
        break;
      default:
        super.handle_turn_flag(turn, frame, flags);
        break;
    }
  }
  override find_auto_frame(): IFrameInfo {
    const { in_the_air, standing } = this.data.base.indexes;
    const fid = this.position.y ? in_the_air[0] : standing;
    return this.data.frames[fid] ?? super.find_auto_frame();
  }

  override dispose() {
    this.controller.dispose();
    this._disposers.forEach(f => f());
    this.world.del_entities(this);
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
        this._next_frame = (f.next);
        break;
      case Defines.State.Jump:
        this._next_frame = ({ id: indexes.landing_1 });
        break;
      case Defines.State.Flame:
      case Defines.State.Falling:
        // eslint-disable-next-line eqeqeq
        const d =
          find_direction(f, indexes.bouncing) ||
          find_direction(f, indexes.falling) ||
          find_direction(f, indexes.critical_hit) || this.face
        if (this.velocity.y <= -4) {
          this._next_frame = ({ id: indexes.bouncing[d][1] });
          return 2;
        }
        this._next_frame = ({ id: indexes.lying[d] });
        break;
      case Defines.State.Frozen:
        if (this.velocity.y <= -4) {
          this._next_frame = ({ id: indexes.bouncing[this.face] });
          return 2;
        }
        break;
      default:
        this._next_frame = ({ id: indexes.landing_2 });
        break;
    }
  }
  override on_after_update() {
    const { state } = this.get_frame();
    switch (state) {
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
  override on_after_state_update(): void {
    const nf_1 = this.controller.update();
    const nf_0 = this.update_catching();
    this._next_frame = nf_1 || nf_0;
  }
  override handle_frame_velocity() {
    super.handle_frame_velocity();
    const { dvz } = this.get_frame();
    const { UD1 } = this.controller;
    if (dvz !== void 0 && dvz !== 0) this.velocity.z = UD1 * dvz;
  }

  update_catching(): TNextFrame | undefined {
    if (!this._catching) return;
    const { cpoint: cpoint_a, pic, centerx: centerx_a, centery: centery_a } = this.get_frame();
    if (typeof pic === 'number') return;

    const { cpoint: cpoint_b, centerx: centerx_b, centery: centery_b } = this._catching.get_frame();
    if (!cpoint_a || !cpoint_b) return;

    if (cpoint_a.decrease < 0) {
      this._catching_value += cpoint_a.decrease;
      if (this._catching_value < 0) this._catching_value = 0;
    }
    if (!this._catching_value) {
      this._catching._next_frame = { id: this._catching.data.base.indexes.falling[-1] }
      this._catching.velocity.y = 3;
      this._catching.velocity.x = this.face * 2;
      delete this._catching._catcher;
      delete this._catching;
      return { id: 'auto' };
    }
    if (cpoint_a.vaction) {
      this._catching.enter_frame(cpoint_a.vaction);
    }
    if (cpoint_a.injury) {
      this._catching.hp += cpoint_a.injury;
    }
    if (cpoint_a.shaking) {
      this._catching._shaking = V_SHAKE;
    }


    const { throwvx, throwvy, throwvz, x: catch_x, y: catch_y, cover } = cpoint_a;
    const { x: caught_x, y: caught_y } = cpoint_b;

    if (throwvx) this._catching.velocity.x = throwvx * this.face;
    if (throwvy) this._catching.velocity.y = throwvy;
    if (throwvz) this._catching.velocity.z = throwvz * this.controller.UD1;
    if (throwvx || throwvy || throwvz) {
      delete this._catching._catcher;
      delete this._catching;
    } else {
      const face_a = this.face;
      const face_b = this._catching.face;
      const { x: px, y: py, z: pz } = this.position;
      this._catching.position.x = px - face_a * (centerx_a - catch_x) + face_b * (centerx_b - caught_x);
      this._catching.position.y = py + centery_a - catch_y - centery_b + caught_y;
      this._catching.position.z = pz;
      if (cover === 11) this._catching.position.z += 1;
      else if (cover === 10) this._catching.position.z -= 1;
      this._catching.update_sprite_position();
    }



  }

  override update_sprite_position() {
    super.update_sprite_position();

    if (this._name_sprite) {
      const { x, z } = this.position;
      this._name_sprite.position.set(x, - z / 2, z)
      this.world.restrict(this._name_sprite);
    }
  }
  private catch_test(target: Entity) {
    return (this.velocity.x > 0 && target.position.x > this.position.x) ||
      (this.velocity.x < 0 && target.position.x < this.position.x)
  }
  private start_catch(target: Entity, itr: IItrInfo) {
    if (!(target instanceof Character)) return;
    if (itr.catchingact === void 0) return;
    this._catching_value = 602;
    delete this._next_frame;
    this.enter_frame({ id: itr.catchingact });
    this._catching = target;
    this._resting = 0;
    this._fall_value = 70;
    this._defend_value = 50;
  }
  private start_caught(attacker: Entity, itr: IItrInfo) {
    if (!(attacker instanceof Character)) return;
    if (itr.caughtact === void 0) return;
    this._catcher = attacker;
    this.enter_frame({ id: itr.caughtact, turn: attacker.face })
    delete this._next_frame;
  }
  override on_collision(target: Entity, itr: IItrInfo, bdy: IBdyInfo, a_cube: ICube, b_cube: ICube): void {
    super.on_collision(target, itr, bdy, a_cube, b_cube);
    switch (itr.kind) {
      case Defines.ItrKind.Catch:
        if (this.catch_test(target))
          this.start_catch(target, itr);
        break;
      case Defines.ItrKind.ForceCatch: {
        this.start_catch(target, itr);
        break;
      }
    }
  }
  override on_be_collided(attacker: Entity, itr: IItrInfo, bdy: IBdyInfo, r0: ICube, r1: ICube): void {
    super.on_be_collided(attacker, itr, bdy, r0, r1);
    if (itr.kind === Defines.ItrKind.SuperPunchMe) return;

    switch (itr.kind) {
      case Defines.ItrKind.Catch:
        if (attacker instanceof Character && attacker.catch_test(this))
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
    const aface = attacker.face;

    /** 破防系数 */
    const bdefend = itr.bdefend || 0;

    this._resting = 30
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
        this.enter_frame({ id: indexes.fire[0], turn: turn_face(attacker.face) })
        this._next_frame = void 0;
        return;
      } else if (itr.effect === Defines.ItrEffect.Ice) {
        // TODO: SOUND
        this.enter_frame({ id: indexes.ice, turn: turn_face(attacker.face) })
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
      this.enter_frame({ id: indexes.fire[0], turn: turn_face(attacker.face) })
      this._next_frame = void 0;
      return;
    } else if (itr.effect === Defines.ItrEffect.Ice) {
      // TODO: SOUND
      this.enter_frame({ id: indexes.ice, turn: turn_face(attacker.face) })
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

  override spawn_object(opoint: IOpointInfo) {
    const ret = super.spawn_object(opoint);
    if (ret instanceof Ball) { ret.ud = this.controller.UD1; }
    return ret;
  }
}

factory.set('character', (...args) => new Character(...args))