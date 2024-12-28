export function find<T>(set: Iterable<T>, p: (v: T) => unknown): T | undefined {
  for (const i of set) if (p(i)) return i;
}
export function find_last<T>(
  set: Iterable<T>,
  p: (v: T) => unknown,
): T | undefined {
  for (const i of Array.from(set).reverse()) if (p(i)) return i;
}
