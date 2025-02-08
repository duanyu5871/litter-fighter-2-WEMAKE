import Entity from "../entity/Entity";
import { is_character } from "../entity/type_check";
import LF2 from "../LF2";

export class CharactersHelper {
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  list(): Entity[] {
    const ret: Entity[] = [];
    this.lf2.world.entities.forEach((v) => is_character(v) && ret.push(v));
    return ret;
  }
  at(idx: number): Entity | undefined {
    return this.list()[idx];
  }
}
