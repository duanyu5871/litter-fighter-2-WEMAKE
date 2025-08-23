import { ICollision } from "../base";
import { BdyKind } from "../defines";
import { handle_rest } from "./handle_rest";
import { handle_stiffness } from "./handle_stiffness";

export function handle_body_goto(collision: ICollision): void {
  handle_rest(collision);
  handle_stiffness(collision);

  const { bdy, victim } = collision;
  if (bdy.kind >= BdyKind.GotoMin && bdy.kind <= BdyKind.GotoMax) {
    const result = victim.get_next_frame({ id: "" + (bdy.kind - 1000) });
    if (result) victim.next_frame = result.frame;
    return;
  }
}
