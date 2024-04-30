import { IFrameInfo } from "../../../common/lf2_type";
import { Defines } from "../../../common/lf2_type/defines";
import { Character } from '../../entity/Character';
import { Entity } from "../../entity/Entity";
import BaseState from "../base/BaseState";
import BaseCharacterState from "./Base";
import Burning from "./Burning";
import Dash from "./Dash";
import Falling from "./Falling";
import Frozen from "./Frozen";
import Jump from "./Jump";
import Lying from "./Lying";
import Running from "./Running";
import Standing from "./Standing";
import Walking from "./Walking";

export const CHARACTER_STATES = new Map<number, BaseState<Character>>()
CHARACTER_STATES.set(Defines.State.Any, new BaseCharacterState())
CHARACTER_STATES.set(Defines.State.Standing, new Standing());
CHARACTER_STATES.set(Defines.State.Walking, new Walking());
CHARACTER_STATES.set(Defines.State.Running, new Running());
CHARACTER_STATES.set(Defines.State.Jump, new Jump());
CHARACTER_STATES.set(Defines.State.Dash, new Dash());
CHARACTER_STATES.set(Defines.State.Falling, new Falling());
CHARACTER_STATES.set(Defines.State.Burning, new Burning());
CHARACTER_STATES.set(Defines.State.Frozen, new Frozen());
CHARACTER_STATES.set(Defines.State.Lying, new Lying())

CHARACTER_STATES.set(Defines.State.Caught, new class extends BaseState<Character> {
  enter(_e: Character): void {
    _e.velocity.set(0, 0, 0);
  }
}())

CHARACTER_STATES.set(Defines.State.Z_Moveable, new class extends BaseCharacterState {
  update(e: Character): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}())

CHARACTER_STATES.set(Defines.State.NextAsLanding, new class extends BaseCharacterState {
  on_landing(e: Character, vx: number, vy: number, vz: number): void {
    e.enter_frame(e.get_frame().next)
  }
}())

CHARACTER_STATES.set(Defines.State.Teleport_ToNearestEnemy, new class extends BaseCharacterState {
  enter(m: Character): void {
    let _dis: number = -1;
    let _tar: Character | undefined;
    for (const o of m.world.entities) {
      if (!Character.is(o) || o === m || o.same_team(m)) continue;
      const dis =
        Math.abs(o.position.x - m.position.x) +
        Math.abs(o.position.z - o.position.z);
      if (_dis < 0 || dis < _dis) {
        _dis = dis;
        _tar = o;
      }
    }

    if (!_tar) {
      m.position.y = 0;
      return;
    }
    m.position.x = _tar.position.x - m.facing * 120;
    m.position.z = _tar.position.z;
    m.position.y = 0;
  }
}())

CHARACTER_STATES.set(Defines.State.Teleport_ToFarthestAlly, new class extends BaseCharacterState {
  enter(m: Character): void {
    let _dis: number = -1;
    let _tar: Character | undefined;
    for (const o of m.world.entities) {
      if (!Character.is(o) || o === m || !o.same_team(m)) continue;

      const dis =
        Math.abs(o.position.x - m.position.x) +
        Math.abs(o.position.z - o.position.z);
      if (dis > _dis) {
        _dis = dis;
        _tar = o;
      }
    }

    if (!_tar) {
      m.position.y = 0;
      return;
    }
    m.position.x = _tar.position.x - m.facing * 60;
    m.position.z = _tar.position.z;
    m.position.y = 0;
  }
}())
