import list_fn from "../../common/list_fn";

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

