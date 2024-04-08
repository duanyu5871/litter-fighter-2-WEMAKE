import { is_num } from '../../js_utils/is_num';
import { is_str } from '../../js_utils/is_str';

export const read_as_4_nums = (v: string | number[] | null | undefined, a1: number, a2: number, a3: number, a4: number): [number, number, number, number] => {
  if (!v) return [a1, a2, a3, a4];
  if (is_num(v)) return [v, v, v, v];
  if (is_str(v)) v = v.replace(/\s/g, '').split(',').map(v => Number(v));
  else v = v.map(v => Number(v));

  const [b1, b2, b3, b4] = v;
  return [
    Number.isNaN(b1) ? a1 : b1,
    Number.isNaN(b2) ? a2 : b2,
    Number.isNaN(b3) ? a3 : b3,
    Number.isNaN(b4) ? a4 : b4
  ];
};
