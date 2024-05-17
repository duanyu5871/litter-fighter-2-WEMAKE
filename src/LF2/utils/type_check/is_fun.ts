type TAnyFunc = (...args: any[]) => unknown;
export function is_fun<F extends TAnyFunc = TAnyFunc>(v: any): v is F {
  return typeof v === 'function';
}
