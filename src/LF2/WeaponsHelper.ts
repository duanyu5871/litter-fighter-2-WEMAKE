import { is_weapon } from "./entity/type_check";
import Weapon from "./entity/Weapon";
import LF2 from "./LF2";

export class WeaponsHelper {
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2;
  }
  entities() {
    const ret: Weapon[] = [];
    this.lf2.world.entities.forEach((v) => is_weapon(v) && ret.push(v));
    return ret;
  }
  entity(idx: number) {
    return this.entities()[idx];
  }
}
