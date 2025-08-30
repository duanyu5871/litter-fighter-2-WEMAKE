import type { Entity } from "../entity";
import { abs, between, pow } from "../utils";
import { IBotRay } from "./IBotRay";
import { project_to_line } from "./project_to_line";

export function is_ai_ray_hit(a: Entity, b: Entity, ray: IBotRay) {
  const p0 = a.position;
  const p1 = b.position;

  const {
    x, z,
    min_x = 0, max_x = 10000,
    min_z = 0, max_z = 10000,
    max_d = 400,
    reverse = false,
  } = ray

  const dx = p1.x - p0.x;
  const dz = p1.z - p0.z;
  if (!between(a.facing * dx, min_x, max_x))
    return reverse;
  if (!between(abs(dz), min_z, max_z))
    return reverse;

  const [px, pz] = project_to_line(dx, dz, x * a.facing, z)
  const hit = pow(dx - px, 2) + pow(dz - pz, 2) < max_d
  return reverse ? !hit : hit;
}
