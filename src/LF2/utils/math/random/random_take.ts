import { random_in } from "./random_in";

export function random_take<T>(v: T[]): T | undefined {
  const idx = Math.floor(random_in(0, v.length));
  return v.splice(idx, 1)[0];
}