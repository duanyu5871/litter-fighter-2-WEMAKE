import type { Character } from '../../entity/Character';
import { BaseCharacterState } from "./Base";


export default class Standing extends BaseCharacterState {
  update(e: Character): void {
    super.update(e);
    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    } else if (e.position.y > 0) {
      e.enter_frame({ id: e.data.indexes.in_the_sky });
    }
  }
}
