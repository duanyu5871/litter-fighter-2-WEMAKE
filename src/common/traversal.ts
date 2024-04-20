type TKey = string | number | symbol;
export function traversal<K extends TKey, V>(r: Record<K, V>): [K, V, Record<K, V>][];
export function traversal<K extends TKey, V>(r: Record<K, V>, func: (k: K, v: V, r: Record<K, V>) => void): void;
export function traversal<K extends TKey, V>(r: Record<K, V>, func?: (k: K, v: V, r: Record<K, V>) => void): (readonly [K, V, Record<K, V>])[] | void {
  const items = Object.keys(r).map(_k => {
    const k = _k as K;
    func?.(k, r[k], r);
    return [k, r[k], r] as const;
  });
  if (!func) return items;
}

export function map<K extends TKey, V, T>(r: Record<K, V>, func: (k: K, v: V, r: Record<K, V>) => T): T[] {
  return Object.keys(r).map(k => func(k as K, r[k as K], r));
}

