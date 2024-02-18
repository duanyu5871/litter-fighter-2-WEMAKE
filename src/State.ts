/* eslint-disable new-parens */
import { AnyState } from "./AnyState";
import BaseState from "./BaseState";
import type Character from './G/Character';
import World from "./G/World";
import { Defines } from "./defines";

export const ENTITY_STATES = new Map<number, BaseState>()
ENTITY_STATES.set(Defines.State.Any, new AnyState)

export const CHARACTER_STATES = new Map<number, BaseState<Character>>()
CHARACTER_STATES.set(Defines.State.Any, new AnyState)
CHARACTER_STATES.set(Defines.State.Standing, new class extends AnyState<Character> {
  update(e: Character): void {
    super.begin(e);
    e.check_leniency_hit_a();
    super.end(e)
  }
})
CHARACTER_STATES.set(Defines.State.Walking, new class extends AnyState<Character> {
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
    e.check_leniency_hit_a();
    super.end(e)
  }
})
CHARACTER_STATES.set(Defines.State.Running, new class extends AnyState<Character> {
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
CHARACTER_STATES.set(Defines.State.Attacking, new class extends AnyState<Character> {
  update(e: Character): void {
    super.begin(e);
    const [prev, curr] = e.goto_next_frame_when_need();
    e.setup_leniency_hit_a(prev, curr)
  }
})
CHARACTER_STATES.set(Defines.State.Jump, new class extends AnyState<Character> {
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
CHARACTER_STATES.set(Defines.State.Dash, new class extends AnyState<Character> {
  enter(e: Character): void {
    if (e.position.y > 0 && e.velocity.y !== 0) return;
    const { dash_distance: dx, dash_distancez: dz, dash_height: h } = e.data.base;
    const { UD, LR } = e.controller
    e.velocity.y = World.DEFAULT_GRAVITY * Math.sqrt(2 * h / World.DEFAULT_GRAVITY);
    if (UD > 0) e.velocity.z = dz;
    else if (UD < 0) e.velocity.z = -dz;
    if (LR < 0) e.velocity.x = -dx;
    else if (LR > 0) e.velocity.x = dx;
    else if (e.velocity.x > 0) e.velocity.x = dx;
    else if (e.velocity.x < 0) e.velocity.x = -dx;
  }
})
CHARACTER_STATES.set(Defines.State.Defend, new AnyState)