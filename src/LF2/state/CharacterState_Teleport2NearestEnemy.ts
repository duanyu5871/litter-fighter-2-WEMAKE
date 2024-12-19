import Character from '../entity/Character';
import { is_character } from '../entity/type_check';
import CharacterState_Base from "./CharacterState_Base";

export default class CharacterState_Teleport2NearestEnemy extends CharacterState_Base {
  override enter(m: Character): void {
    let _dis: number = -1;
    let _tar: Character | undefined;
    for (const o of m.world.entities) {
      if (!is_character(o) || o === m || o.same_team(m)) continue;
      const dis = Math.abs(o.position.x - m.position.x) +
        Math.abs(o.position.z - o.position.z);
      if (_dis < 0 || dis < _dis) {
        _dis = dis;
        _tar = o;
      }
    }

    if (!_tar) {
      m.position.y = 0;
      return;
    }
    m.position.x = _tar.position.x - m.facing * 120;
    m.position.z = _tar.position.z;
    m.position.y = 0;
  }
}
