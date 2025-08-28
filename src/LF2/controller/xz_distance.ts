import { Entity } from "../entity";
import { abs } from "../utils";

export function xz_distance(a: Entity, b: Entity) {
  return abs(a.position.x - b.position.x) + (a.position.z - b.position.z);
}
