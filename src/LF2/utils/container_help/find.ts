
export function find<T>(set: Set<T>, p: (v: T) => unknown): T | undefined;
export function find<T>(array: T[], p: (v: T) => unknown): T | undefined;
export function find<K, V>(iterable: Map<K, V>, p: (v: [K, V]) => unknown): [K, V] | undefined;
export function find<K extends string | number | symbol, V>(iterable: Record<K, V>, p: (v: V, k: K) => unknown): V | undefined;
export function find(p0: any, p1: (...v: any[]) => unknown): any | undefined {
  if (typeof p0[Symbol.iterator] === 'function')
    for (const v of p0) if (p1(v)) return v;
  for (const k in p0) if (p1(p0[k], k)) return p0[k]
}

export function find_last<T>(
  set: Iterable<T>,
  p: (v: T) => unknown,
): T | undefined {
  for (const i of Array.from(set).reverse()) if (p(i)) return i;
}