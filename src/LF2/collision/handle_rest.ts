import { ICollision } from "../base";
import { Defines } from "../defines";


export function handle_rest(collision: ICollision): void {
  const { attacker, victim, v_rest, itr } = collision;

  if (v_rest !== void 0) {
    victim.v_rests.set(collision.attacker.id, collision);
  } else {
    const arest = itr.arest ?? Defines.DEFAULT_ITR_MOTIONLESS * 2;
    attacker.a_rest = arest + attacker.world.arest_offset;
  }
}
