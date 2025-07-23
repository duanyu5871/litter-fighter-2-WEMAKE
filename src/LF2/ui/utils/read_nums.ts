import { is_nan, is_num, is_str } from "../../utils/type_check";
/**
 * 读取固定长度为4的数字数组
 *
 * @export
 * @param {(string | number[] | null | undefined)} src
 * @param {4} len
 * @param {[number, number, number, number]} [fallbacks]
 * @return {[number, number, number, number]}
 */
export default function read_nums(
  src: string | number[] | null | undefined,
  len: 4,
  fallbacks?: [number, number, number, number],
): [number, number, number, number];

/**
 * 读取固定长度为3的数字数组
 *
 * @export
 * @param {(string | number[] | null | undefined)} src
 * @param {3} len
 * @param {[number, number, number]} [fallbacks]
 * @return {[number, number, number]}
 */
export default function read_nums(
  src: string | number[] | null | undefined,
  len: 3,
  fallbacks?: [number, number, number],
): [number, number, number];

/**
 * 读取固定长度为2的数字数组
 *
 * @export
 * @param {(string | number[] | null | undefined)} src
 * @param {2} len
 * @param {[number, number]} [fallbacks]
 * @return {[number, number]}
 */
export default function read_nums(
  src: string | number[] | null | undefined,
  len: 2,
  fallbacks?: [number, number],
): [number, number];
/**
 * 读取指定长度的数字数组
 *
 * @export
 * @param {(string | number[] | null | undefined)} src
 * @param {number} len
 * @param {number[]} [fallbacks]
 * @return {number[]}
 */
export default function read_nums(
  src: string | number[] | null | undefined,
  len: number,
  fallbacks?: number[],
): number[];

export default function read_nums(
  src: string | number[] | null | undefined,
  len: number,
  fallbacks: number[] = [],
): number[] {
  if (len < 1) return [];

  const ret: number[] = [];
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

    if (is_num(num)) {
      ret.push(num);
    } else {
      ret.push(fallbacks[ret.length]!);
    }
  }
  return ret;
}
