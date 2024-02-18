export function traversal<K extends string | number | symbol, V>(r: Record<K, V>): [K, V, Record<K, V>][];
export function traversal<K extends string | number | symbol, V>(r: Record<K, V>, func: (k: K, v: V, r: Record<K, V>) => void): void;
export function traversal<K extends string | number | symbol, V>(r: Record<K, V>, func?: (k: K, v: V, r: Record<K, V>) => void): (readonly [K, V, Record<K, V>])[] | void {
  const items = Object.keys(r).map((k) => {
    const _k = k as K;
    func?.(_k, r[_k], r);
    return [_k, r[_k], r] as const;
  });
  if (!func) return items;
}

