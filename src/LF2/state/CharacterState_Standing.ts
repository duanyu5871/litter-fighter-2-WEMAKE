import type Entity from '../entity/Entity';
import CharacterState_Base from "./CharacterState_Base";


export default class CharacterState_Standing extends CharacterState_Base {
  override update(e: Entity): void {
    super.update(e);
    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    } else if (e.position.y > 0) {
      e.enter_frame(e.data.indexes?.in_the_sky);
    }
  }
}
