type TAnyFunc = (...args: any[]) => unknown;
/**
 * @deprecated 无法正确推导参数与返回值
 */
export function is_fun<F extends TAnyFunc = TAnyFunc>(v: any): v is F {
  return typeof v === 'function';
}
