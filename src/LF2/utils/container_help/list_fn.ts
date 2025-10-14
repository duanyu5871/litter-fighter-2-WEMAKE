
export default function list_fn(obj: any, set?: Set<string>) {
  set = set || new Set<string>()
  if (!obj) return set;
  const keys = Object.getOwnPropertyNames(obj)
  for (const key of keys) {
    switch (key) {
      case 'constructor':
      case '__defineGetter__':
      case '__defineSetter__':
      case 'hasOwnProperty':
      case '__lookupGetter__':
      case '__lookupSetter__':
      case 'isPrototypeOf':
      case 'propertyIsEnumerable':
      case 'toString':
      case 'valueOf':
      case 'toLocaleString':
      case '__proto__ ':
        continue;
    }
    const desc = Object.getOwnPropertyDescriptor(obj, key);
    if (!desc || 'get' in desc || 'set' in desc || typeof obj[key] !== 'function') continue;
    set.add(key);
  }

  const proto = Object.getPrototypeOf(obj);
  list_fn(proto, set);
  return set;
}
