import { Defines } from '../../defines/defines';
import type Character from '../../entity/Character';
import { is_weapon } from '../../entity/type_check';
import BaseCharacterState from "./Base";

export default class Walking extends BaseCharacterState {

  override update(e: Character): void {
    e.handle_gravity();
    e.handle_ground_velocity_decay();
    e.handle_frame_velocity();
    if (e.controller) {
      const { UD, LR } = e.controller;

      if (!UD && !LR && !e.wait) {
        if (is_weapon(e.holding) && e.holding?.data.base.type === Defines.WeaponType.Heavy) {
          e.wait = e.get_frame().wait
        } else {
          e.enter_frame(e.data.indexes.standing);
        }
      }
    } else {
      e.enter_frame(e.data.indexes.standing);
    }
    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    } else if (e.position.y > 0) {
      e.enter_frame({ id: e.data.indexes.in_the_sky });
    }
  }
}
