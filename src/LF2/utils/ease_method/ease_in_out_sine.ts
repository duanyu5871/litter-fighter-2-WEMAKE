import { IEaseMethod } from "./IEaseMethod";

export function ease_in_out_sine(factor: number, from = 0, to = 1): number {
  return from - ((to - from) * (Math.cos(Math.PI * factor) - 1)) / 2;
}
ease_in_out_sine.backward = function (v: number, from = 0, to = 1): number {
  const min = Math.min(from, to);
  const max = Math.max(from, to);
  if (v < min) v = min;
  if (v > max) v = max;
  return Math.acos((2 * (from - v)) / (to - from) + 1) / Math.PI;
};

const exported: IEaseMethod = ease_in_out_sine;
export default exported;
