import { Character } from '../../entity/Character';
import BaseCharacterState from "./Base";

export default class Teleport_ToFarthestAlly extends BaseCharacterState {
  enter(m: Character): void {
    let _dis: number = -1;
    let _tar: Character | undefined;
    for (const o of m.world.entities) {
      if (!Character.is(o) || o === m || !o.same_team(m)) continue;

      const dis = Math.abs(o.position.x - m.position.x) +
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
    m.position.x = _tar.position.x - m.facing * 60;
    m.position.z = _tar.position.z;
    m.position.y = 0;
  }
}
