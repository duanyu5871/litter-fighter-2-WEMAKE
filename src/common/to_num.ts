export function to_num<T>(v: T): number | T;
export function to_num<T>(v: T, or: number): number;
export function to_num<T>(v: T, or?: number): number | T {
  const t = Number(v);
  return !Number.isNaN(t) ? t : (or === void 0) ? v : or;
}
