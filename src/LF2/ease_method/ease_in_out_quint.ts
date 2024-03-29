import { IEaseMethod } from "./IEaseMethod";

function ease_in_out_quint(factor: number, from = 0, to = 1): number {
  const ratio = (factor < 0.5) ?
    16 * factor ** 5 :
    1 - Math.pow(-2 * factor + 2, 5) / 2;
  return from + ratio * (to - from)
}

ease_in_out_quint.backward = function (v: number, from = 0, to = 1): number {
  const min = Math.min(from, to);
  const max = Math.max(from, to);
  if (v < min) v = min;
  if (v > max) v = max;
  const ratio = (v - from) / (to - from);
  return Math.acos(-2 * ratio + 1) / Math.PI;
}

const exported: IEaseMethod = ease_in_out_quint
export default exported;