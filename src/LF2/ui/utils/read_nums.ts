import { is_nan, is_str } from "../../utils/type_check";

export default function read_nums(
  src: string | number[] | null | undefined,
  len: 4,
  fallbacks?: [number, number, number, number],
): [number, number, number, number];
export default function read_nums(
  src: string | number[] | null | undefined,
  len: 3,
  fallbacks?: [number, number, number],
): [number, number, number];
export default function read_nums(
  src: string | number[] | null | undefined,
  len: 2,
  fallbacks?: [number, number],
): [number, number];
export default function read_nums(
  src: string | number[] | null | undefined,
  len: number,
  fallbacks: number[] = [],
): number[] {
  const ret: number[] = [];
  if (len < 1) return [];

  const last_fallback = fallbacks[fallbacks.length - 1] || 0;
  while (fallbacks.length < len) fallbacks.push(last_fallback);

  if (!src || is_nan(src)) return fallbacks;
  if (is_str(src))
    src = src
      .replace(/\s/g, "")
      .split(",")
      .map((v) => Number(v));

  while (ret.length < len) {
    const num: number | undefined = src[ret.length];
    ret.push(num === void 0 || Number.isNaN(num) ? fallbacks[ret.length] : num);
  }
  return ret;
}
