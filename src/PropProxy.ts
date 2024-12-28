export const _proxy_props_map = new Map<any, any>();
export function PropProxy<T extends Object, K extends keyof T>(
  target: T,
  key: K,
) {
  let proxy_props = _proxy_props_map.get(target);
  if (!proxy_props) _proxy_props_map.set(target, (proxy_props = {}));
  proxy_props[key] = target[key];
  Object.defineProperty(target, key, {
    enumerable: false,
    configurable: true,
    get: () => proxy_props[key],
    set: (v) => (proxy_props[key] = v),
  });
}
