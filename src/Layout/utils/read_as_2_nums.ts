import { is_num } from '../../common/is_num';
import { is_str } from '../../common/is_str';

export const read_as_2_nums = (v: string | number | number[] | null | undefined, a1: number, a2: number): [number, number] => {
  if (!v) return [a1, a2];
  if (is_num(v)) return [v, v];
  if (is_str(v)) v = v.replace(/\s/g, '').split(',').map(v => Number(v));
  else v = v.map(v => Number(v));
  const [b1, b2] = v;
  return [
    Number.isNaN(b1) ? a1 : b1,
    Number.isNaN(b2) ? a2 : b2
  ];
};
