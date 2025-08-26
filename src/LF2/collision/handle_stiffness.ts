import { ICollision } from "../base";
import { max } from "../utils";


export function handle_stiffness(collision: ICollision) {
  const { itr, attacker, victim } = collision;
  attacker.motionless = itr.motionless ?? collision.victim.world.itr_motionless;

  victim.shaking = itr.shaking ?? collision.attacker.world.itr_shaking;
}
