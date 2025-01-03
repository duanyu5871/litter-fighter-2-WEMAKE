export const is_num = (v: any): v is number =>
  typeof v === "number" && !is_nan(v) && is_finite(v);
export const is_zero = (v: any): v is 0 => v === 0;
export const is_one = (v: any): v is 1 => v === 1;
export const is_nan = (v: any): v is number => Number.isNaN(v);
export const is_finite = (v: any): v is number => Number.isFinite(v);
export const is_nagtive = (v: any): v is number => is_num(v) && v < 0;
export const is_positive = (v: any): v is number => is_num(v) && v > 0;
export const not_zero_num = (v: any): v is number => is_num(v) && v !== 0;

export const num_or = <V>(v: any, or: V) => is_num(v) ? v : or;