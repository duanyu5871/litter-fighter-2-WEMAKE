import { is_fun } from "../../common/is_fun";

export class NoEmitCallbacks<F> {

  /**
   * 回调对象map
   *
   * @protected
   * @type {Map<any, Set<F>>}
   */
  protected _map: Map<any, Set<F>> = new Map<any, Set<F>>();

  /**
   * 添加回调对象
   *
   * @param {F} v 回调对象
   * @returns {() => void} 移除回调对象
   */
  add(v: F): () => void {
    const any_keys = list_fn(v);
    if (!any_keys.size) return () => { }

    for (const key of any_keys) {
      let set = this._map.get(key);
      if (!set) this._map.set(key, set = new Set())
      set.add(v);
    }
    return () => { this.del(v) };
  }


  /**
   * 移除回调对象
   *
   * @param {F} v 回调对象
   */
  del(v: F): void {
    for (const [, set] of this._map) set.delete(v);
  }
}

function list_fn(obj: any, set: Set<string> = new Set<string>()) {
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
    if (!desc) continue;
    if ('get' in desc || 'set' in desc || !is_fun(obj[key]))
      continue;
    set.add(key);
  }

  const proto = Object.getPrototypeOf(obj);
  list_fn(proto, set)
  return set;
}


export default class Callbacks<F> extends NoEmitCallbacks<F> {
  /**
   * 获取指定回调名的回调函数
   *
   * @template {keyof F} K
   * @param {K} fn_name
   * @returns {Exclude<F[K], undefined | null>} 指定回调名的回调函数
   */
  emit<K extends keyof F>(fn_name: K): Exclude<F[K], undefined | null> {
    const ret: any = (...args: any[]) => {
      const set = this._map.get(fn_name);
      if (!set) return
      for (const v of set) (v as any)[fn_name].apply(v, args);
    }
    return ret;
  }
}

