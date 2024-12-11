import type Character from '../../entity/Character';
import BaseState from "../base/BaseState";

export default class BaseCharacterState extends BaseState<Character> {
  override update(e: Character): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
  }
  override on_landing(e: Character, vx: number, vy: number, vz: number): void {
    e.enter_frame({ id: e.data.indexes.landing_2 });
  }
}
