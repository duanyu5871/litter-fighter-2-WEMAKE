export function make_private_properties(place: string, o: any, on_change?: (k: string, curr: any, prev: any) => void) {
  const keys = Object.keys(o);
  for (const key of keys) {
    if (key.startsWith('on_') || key.startsWith('_')) continue;
    const pk = '_' + key;
    if (typeof o[key] === 'function') continue;
    o[pk] = o[key];
    delete o[key];
    const fn_key = `on_${key}_change`
    Object.defineProperty(o, key, {
      get() { return o[pk]; },
      set(v) {
        if (v === o[pk]) return;
        const prev = o[pk]
        o[pk] = v;
        o[fn_key]?.(v, prev)
        on_change?.(key, v, prev)
      }
    });
  }
}
