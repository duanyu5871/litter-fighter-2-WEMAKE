import { random_in } from "./random_in";

export function random_get<T>(v: T[]): T | undefined {
  return v[Math.floor(random_in(0, v.length))]
}