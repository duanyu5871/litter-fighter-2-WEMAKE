import { ICollision } from "../defines/ICollision";

export function handle_itr_kind_force_catch(c: ICollision) {
  c.victim.start_caught(c.attacker, c.itr);
}
