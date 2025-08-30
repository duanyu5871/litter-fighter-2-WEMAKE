import type { Entity } from "../entity";
import { abs, pow, sqrt } from "../utils";

export function dist_xz(a: Entity, b: Entity, s: any = 0): number {
  const ret = (
    pow(abs(a.position.x - b.position.x), 2) +
    pow(abs(a.position.z - b.position.z), 2)
  )
  if (s) return sqrt(ret)
  return ret;
}
