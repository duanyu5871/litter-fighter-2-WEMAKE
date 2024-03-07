/* eslint-disable new-parens */
import { IFrameInfo, TFrameId } from "../../js_utils/lf2_type";
import { Defines } from "../../js_utils/lf2_type/defines";
import { World } from "../World";
import type { Character } from '../entity/Character';
import BaseState from "./BaseState";

export const CHARACTER_STATES = new Map<number, BaseState<Character>>()

class BaseCharacterState extends BaseState<Character> {
  update(e: Character): void {
    this.begin(e);
    this.end(e);
  }
  begin(e: Character) {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
  end(e: Character) {
    e.goto_next_frame_when_need();
  }
}


CHARACTER_STATES.set(Defines.State.Any, new BaseCharacterState)
CHARACTER_STATES.set(Defines.State.Standing, new BaseCharacterState)
CHARACTER_STATES.set(Defines.State.Walking, new class extends BaseCharacterState {
  update(e: Character): void {
    e.on_gravity();
    e.velocity_decay();
    const { dvx = 0, dvz = 0 } = e.get_frame();
    const { UD, LR, LRUD } = e.controller;
    const speed_z = UD * dvz
    const speed_x = (LR / 2) * (dvx - Math.abs(speed_z / 4));
    if (speed_x) e.velocity.x = speed_x;
    if (speed_z) e.velocity.z = speed_z;
    if (!LRUD && !e.wait) {
      e.enter_frame({ id: e.data.base.indexes.standing });
    }
    super.end(e)
  }
})
CHARACTER_STATES.set(Defines.State.Running, new class extends BaseCharacterState {
  update(e: Character): void {
    e.on_gravity();
    e.velocity_decay();
    const { dvx = 0, dvz = 0 } = e.get_frame();
    const i = e.controller.UD;
    const speed_z = i * dvz;
    const speed_x = e.face * (dvx - Math.abs(speed_z))
    e.velocity.x = speed_x;
    e.velocity.z = speed_z;
    super.end(e)
  }
})
CHARACTER_STATES.set(Defines.State.Attacking, new class extends BaseCharacterState {
  update(e: Character): void {
    super.begin(e);
    const [prev, curr] = e.goto_next_frame_when_need();
    e.setup_leniency_hit_a(prev, curr)
  }
})
CHARACTER_STATES.set(Defines.State.Jump, new class extends BaseCharacterState {
  update(e: Character): void {
    super.begin(e);
    const [prev, curr] = e.goto_next_frame_when_need();
    if (prev !== curr && !Array.isArray(curr?.next) && curr?.next.id === 'self') {
      const { jump_height: h, jump_distance: dx, jump_distancez: dz } = e.data.base;

      e.velocity.y = World.DEFAULT_GRAVITY * Math.sqrt(2 * h / World.DEFAULT_GRAVITY);
      const { LR, UD } = e.controller;
      if (LR < 0) e.velocity.x = -dx;
      else if (LR > 0) e.velocity.x = dx;
      if (UD < 0) e.velocity.z = -dz;
      else if (UD > 0) e.velocity.z = dz;
    }
  }
})
CHARACTER_STATES.set(Defines.State.Dash, new class extends BaseCharacterState {
  enter(e: Character, prev_frame: IFrameInfo): void {
    if (e.position.y > 0 && e.velocity.y !== 0) return;
    const { dash_distance: dx, dash_distancez: dz, dash_height: h } = e.data.base;
    e.velocity.y = World.DEFAULT_GRAVITY * Math.sqrt(2 * h / World.DEFAULT_GRAVITY);
    const { UD1, LR1 } = e.controller
    e.velocity.z = UD1 * dz;
    if (prev_frame.state === Defines.State.Running) {
      e.velocity.x = e.face * dx;
    }
    else if (LR1) e.velocity.x = LR1 * dx;
    else if (e.velocity.x > 0) e.velocity.x = dx;
    else if (e.velocity.x < 0) e.velocity.x = -dx;
    else e.velocity.x = e.face * dx;
  }
})
CHARACTER_STATES.set(Defines.State.Defend, new BaseCharacterState)
CHARACTER_STATES.set(Defines.State.Falling, new class extends BaseCharacterState {
  _directions = new Map<string | number, 1 | -1>();
  _ignore_frames = new Map<string | number, Set<TFrameId>>();
  enter(e: Character, prev_frame: IFrameInfo): void {
    console.log('Lying Falling enter')
    super.enter(e, prev_frame);
    const { id: entity_id, velocity: { x: vx }, face } = e;
    const { id: data_id, base: { indexes: { bouncing } } } = e.data;

    let dd: 1 | -1 = -1;
    if ((vx < 0 && face < 0) || (vx > 0 && face > 0)) dd = 1;

    // eslint-disable-next-line eqeqeq
    this._directions.set(entity_id, dd);
    if (!this._ignore_frames.has(data_id)) {
      this._ignore_frames.set(data_id, new Set(
        [
          ...bouncing[1].map(v => v.toString()),
          ...bouncing[-1].map(v => v.toString()),
        ]
      ))
    }
  }
  begin(e: Character): void {
    e.on_gravity();

    const { data: { id: data_id } } = e;
    const ignore_frames = this._ignore_frames.get(data_id)
    const { id: frame_id } = e.get_frame();
    if (ignore_frames?.has('' + frame_id)) {
      e.velocity_decay(0.5);
    } else {
      e.velocity_decay();
    }


    e.handle_frame_velocity();
  }
  update(e: Character): void {
    super.update(e);
    if (e.shaking > 0) {
      return;
    } else {
      const { id: entity_id, data: { id: data_id, base: { indexes: { falling } } } } = e;
      const { id: frame_id } = e.get_frame();
      const direction = this._directions.get(entity_id);
      if (!direction) return
      const ignore_frames = this._ignore_frames.get(data_id)
      if (ignore_frames && ignore_frames.has('' + frame_id)) return;

      if (e.velocity.y < -1) {
        e.enter_frame({ id: falling[direction][3] })
      } else if (e.velocity.y > 1) {
        e.enter_frame({ id: falling[direction][1] })
      } else {
        e.enter_frame({ id: e.data.base.indexes.falling[direction][2] })
      }
    }
  }
  leave(e: Character): void {
    console.log('Lying Falling leave')
    const { id: entity_id } = e;
    this._directions.delete(entity_id);
  }
})
CHARACTER_STATES.set(Defines.State.Lying, new class extends BaseCharacterState {

  begin(e: Character) {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
  enter(e: Character, prev_frame: IFrameInfo): void {
    console.log('Lying enter')
  }
  leave(e: Character, next_frame: IFrameInfo): void {
    console.log('Lying leave')
  }
})
CHARACTER_STATES.set(Defines.State.Caught, new class extends BaseState<Character>{
  enter(_e: Character): void {
    _e.velocity.set(0, 0, 0);
  }
})