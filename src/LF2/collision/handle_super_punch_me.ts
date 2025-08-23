import { ICollision } from "../base";

export function handle_super_punch_me(collision: ICollision): void {
  const { victim, attacker } = collision;
  victim.v_rests.set(attacker.id, collision);
}
