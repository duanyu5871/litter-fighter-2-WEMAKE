import { random_in } from "./random_in";

export function random_get<T>(v: T[] | undefined): T | undefined {
  if (!v?.length) return void 0;
  if (v.length === 1) return v[0];
  return v[Math.floor(random_in(0, v.length))];
}
