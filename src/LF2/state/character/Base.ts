import type Character from '../../entity/Character';
import BaseState from "../base/BaseState";

export default class BaseCharacterState extends BaseState<Character> {
  update(e: Character): void {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
  on_landing(e: Character, vx: number, vy: number, vz: number): void {
    e.enter_frame({ id: e.data.indexes.landing_2 });
  }
}
