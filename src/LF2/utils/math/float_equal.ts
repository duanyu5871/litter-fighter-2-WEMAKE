import { abs } from "./base";

export function float_equal(x: number, y: number): boolean {
  return abs(x - y) < Number.EPSILON;
}
export default float_equal