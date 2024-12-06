import type Character from '../../entity/Character';
import BaseCharacterState from "./Base";

export default class Jump extends BaseCharacterState {
  private _jump_flags = new Set<Character>();
  update(character: Character): void {
    character.on_gravity();
    character.velocity_decay();
    character.handle_frame_velocity();

    const { jump_flag } = character.get_prev_frame();
    if (!jump_flag) {
      this._jump_flags.delete(character);
      return;
    }
    if (this._jump_flags.has(character))
      return;

    const { LR: LR1 = 0, UD: UD1 = 0 } = character.controller || {};
    const { jump_height: h, jump_distance: dx, jump_distancez: dz } = character.data.base;
    const g_acc = character.world.gravity
    const vz = UD1 * dz;
    character.velocity.set(
      LR1 * (dx - Math.abs(vz / 4)),
      g_acc * Math.sqrt(2 * h / g_acc),
      vz
    )
    this._jump_flags.add(character);
  }
  on_landing(character: Character, vx: number, vy: number, vz: number): void {
    character.enter_frame({ id: character.data.indexes.landing_1 });
  }
}
