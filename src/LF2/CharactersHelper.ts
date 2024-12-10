import Character from "./entity/Character";
import { is_character } from "./entity/type_check";
import LF2 from "./LF2";

export class CharactersHelper {
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  entities() {
    const ret: Character[] = [];
    this.lf2.world.entities.forEach((v) => is_character(v) && ret.push(v));
    return ret;
  }
  entity(idx: number) {
    return this.entities()[idx];
  }
}
