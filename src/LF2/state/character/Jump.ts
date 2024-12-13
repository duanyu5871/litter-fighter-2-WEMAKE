import { IFrameInfo } from '../../defines';
import type Character from '../../entity/Character';
import BaseCharacterState from "./Base";

export default class Jump extends BaseCharacterState {
  private _jumpings = new Set<Character>();

  override update(character: Character): void {
    character.handle_gravity();
    character.handle_ground_velocity_decay();
    character.handle_frame_velocity();

    const { jump_flag } = character.get_prev_frame();
    if (!jump_flag) {
      this._jumpings.delete(character);
      return;
    }
    if (this._jumpings.has(character)) {
      return;
    }
    const { LR: LR1 = 0, UD: UD1 = 0 } = character.controller || {};
    const { jump_height: h = 0, jump_distance: dx = 0, jump_distancez: dz = 0 } = character.data.base;
    const g_acc = character.world.gravity
    const vz = UD1 * dz;
    character.velocity.set(
      LR1 * (dx - Math.abs(vz / 4)),
      g_acc * Math.sqrt(2 * h / g_acc),
      vz
    )
    this._jumpings.add(character);
  }
  override on_landing(character: Character, vx: number, vy: number, vz: number): void {
    character.enter_frame({ id: character.data.indexes.landing_1 });
  }
}
