import { is_fun } from "./is_fun";

export default function list_fn(obj: any, set: Set<string> = new Set<string>()) {
  if (!obj) return set;
  for (const key of Object.getOwnPropertyNames(obj)) {
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
    if (!desc || 'get' in desc || 'set' in desc || !is_fun(obj[key]))
      continue;
    set.add(key);
  }

  const proto = Object.getPrototypeOf(obj);
  list_fn(proto, set);
  return set;
}
