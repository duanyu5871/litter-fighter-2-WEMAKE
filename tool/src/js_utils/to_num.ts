
export function to_num<T>(v: T): number | T;
export function to_num<T>(v: T, or: number): number;
export function to_num<T>(v: T, or?: number): number | T {
  const t = Number(v);
  return Number.isNaN(t) ? v : (or === void 0) ? t : or;
}
