import { not_zero_num } from "../utils";
import { take } from "./take";

export function take_not_zero_num(
  any: any,
  key: string | number | symbol,
  fn?: (n: number) => number
): number | undefined {
  const v = Number(take(any, key));
  return !not_zero_num(v) ? void 0 : fn ? fn(v) : v;
}