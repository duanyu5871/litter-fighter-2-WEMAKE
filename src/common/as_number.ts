export function as_number(v: any): number | undefined;
export function as_number<T>(v: any, or: T): number | T;
export function as_number<T>(v: any, or?: T): number | T | undefined {
  return (typeof v === 'number') ? v : or;
}

export function take_number(v: any, k: any): number | undefined;
export function take_number<T>(v: any, k: any, or: T): number | T;
export function take_number<T>(v: any, k: any, or?: T): number | T | undefined {
  const ret = (typeof v[k] === 'number') ? v[k] : or;
  delete v[k];
  return ret;
}
