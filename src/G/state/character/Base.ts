import type { Character } from '../../entity/Character';
import BaseState from "../BaseState";

export class BaseCharacterState extends BaseState<Character> {
  update(e: Character): void {
    this.begin(e);
  }
  begin(e: Character) {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
  on_landing(e: Character, vx: number, vy: number, vz: number): void {
    e.enter_frame({ id: e.data.base.indexes.landing_2 });
  }
}
