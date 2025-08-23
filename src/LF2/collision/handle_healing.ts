import { ICollision } from "../base";

export function handle_healing(collision: ICollision): void {
  const { itr, victim } = collision;
  if (itr.injury) victim.healing = itr.injury;
}
