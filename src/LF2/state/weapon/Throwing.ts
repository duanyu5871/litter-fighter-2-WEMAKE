import type Weapon from "../../entity/Weapon";
import InTheSky from "./InTheSky";

export default class Throwing extends InTheSky {
  get_gravity(e: Weapon) {
    return e.world.gravity * 0.6
  };
}
