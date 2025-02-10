import { ICollision } from "../base/ICollision";

export function handle_itr_kind_catch(c: ICollision) {
  if (c.attacker.dizzy_catch_test(c.victim))
    c.victim.start_caught(c.attacker, c.itr);
}
