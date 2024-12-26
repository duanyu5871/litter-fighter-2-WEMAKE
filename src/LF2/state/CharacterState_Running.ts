import type Entity from '../entity/Entity';
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Running extends CharacterState_Base {
  override update(e: Entity): void {
    super.update(e);
    if (e.velocities[0].z) {
      const dz = Math.abs(e.velocities[0].z / 4);
      if (e.velocities[0].x > 0) {
        e.velocities[0].x -= dz
      } else if (e.velocities[0].x < 0) {
        e.velocities[0].x += dz;
      }
    }
    if (e.hp <= 0) {
      e.enter_frame(e.get_sudden_death_frame());
    }
  }
}
