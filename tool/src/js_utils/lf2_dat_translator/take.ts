export function take<O extends {} = any, K extends keyof O = keyof O>(any: O, key: K): O[K];
export function take(any: any, key: string | number | symbol): any;
export function take(any: any, key: string | number | symbol): any {
  if (!any) return;
  const ret = any[key];
  delete any[key];
  return ret;
};
