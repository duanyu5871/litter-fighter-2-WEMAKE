import type { Entity } from "../entity";
import { abs, between, pow } from "../utils";
import { IAiRay } from "./IAiData";
import { project_to_line } from "./project_to_line";

export function is_ai_ray_hit(a: Entity, b: Entity, ray: IAiRay) {
  const p0 = a.position;
  const p1 = b.position;

  const {
    x, z,
    min_x = 0, max_x = 10000,
    min_z = 0, max_z = 10000,
    min_d = 400,
  } = ray

  const dx = p1.x - p0.x;
  const dz = p1.z - p0.z;
  if (!between(a.facing * dx, min_x, max_x))
    return false;
  if (!between(abs(dz), min_z, max_z))
    return false;

  const [px, pz] = project_to_line(dx, dz, x * a.facing, z)
  return pow(dx - px, 2) + pow(dz - pz, 2) < min_d;
}
