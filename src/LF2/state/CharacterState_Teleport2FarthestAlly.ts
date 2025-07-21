import { Entity } from "../entity/Entity";
import { is_character } from "../entity/type_check";
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Teleport2FarthestAlly extends CharacterState_Base {
  override enter(m: Entity): void {
    let _dis: number = -1;
    let _tar: Entity | undefined;
    for (const o of m.world.entities) {
      if (!is_character(o) || o === m || !o.is_ally(m)) continue;

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
    m.position.x = Math.round(_tar.position.x - m.facing * 60);
    m.position.z = Math.round(_tar.position.z);
    m.position.y = 0;
  }
}
