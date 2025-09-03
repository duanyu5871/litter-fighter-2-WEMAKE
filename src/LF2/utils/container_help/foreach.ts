import { Unsafe } from "../type_check";
import { traversal } from "./traversal";

export function foreach<T>(any: Unsafe<T[]>, fn: (value: T, index: number, all: T[]) => void): void;
export function foreach<O>(any: Unsafe<O>, fn: (v: O[keyof O], k: keyof O, r: O) => void): void;
export function foreach(any: any, fn: (v: any, k: any, a: any) => void): void {
  if (!any) return;
  if (Array.isArray(any)) any.forEach(fn);
  if (typeof any === 'object') traversal(any, (v, k, a) => fn(k, v, a))
}
