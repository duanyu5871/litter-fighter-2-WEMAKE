import { is_num } from '../../common/is_num';
import { is_str } from '../../common/is_str';

/**
 * 读取两个数字
 *
 * @export
 * @param {(string | number | number[] | null | undefined)} v 源
 *    当源为字符串，可以读取逗号分隔的两个数字拼接的字符串
 *    当源为一个数字数字，将返回[v,v]
 * @param {number} first
 * @param {number} second 
 * @returns {[number, number]}
 */
export function read_as_2_nums(v: string | number | number[] | null | undefined, first: number, second: number): [number, number] {
  if (null === v || void 0 === v || Number.isNaN(v))
    return [first, second];
  if (is_num(v)) return [v, v];
  if (is_str(v)) v = v.replace(/\s/g, '').split(',').map(v => Number(v));
  else v = v.map(v => Number(v));
  const [b1, b2] = v;
  return [
    Number.isNaN(b1) ? first : b1,
    Number.isNaN(b2) ? second : b2
  ];
}
