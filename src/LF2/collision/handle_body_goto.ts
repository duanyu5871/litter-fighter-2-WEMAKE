import { ICollision } from "../base";
import { handle_stiffness } from "./handle_stiffness";

export function handle_body_goto(collision: ICollision): void {
  handle_stiffness(collision);
}
