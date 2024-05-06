export class NoEmitCallbacks<F> {

  /**
   * 回调对象map
   *
   * @protected
   * @type {Map<any, Set<Partial<F>>>}
   */
  protected _map: Map<any, Set<Partial<F>>> = new Map<any, Set<Partial<F>>>();

  /**
   * 添加回调对象
   *
   * @param {Partial<F>} v 回调对象
   * @param {?(keyof F)[]} [keys] 指定感兴趣的回调名
   * @returns {() => void} 移除回调对象
   */
  add(v: Partial<F>, keys?: (keyof F)[]): () => void {
    const any_keys: any[] = keys?.length ? keys : ['']
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
   * @param {Partial<F>} v 回调对象
   */
  del(v: Partial<F>): void {
    for (const [, set] of this._map) set.delete(v);
  }
}

export default class Callbacks<F> extends NoEmitCallbacks<F> {
  /**
   * 获取指定回调名的回调函数
   *
   * @template {keyof F} K
   * @param {K} key
   * @returns {Exclude<F[K], undefined>} 指定回调名的回调函数
   */
  emit<K extends keyof F>(key: K): Exclude<F[K], undefined> {
    const ret: any = (...args: any[]) => {
      this.invoke<K>('', key, args);
      this.invoke<K>(key, key, args);
    }
    return ret;
  }

  private invoke<K extends keyof F>(n: any, key: K, args: any[]) {
    const set = this._map.get(n);
    if (!set) return
    for (const v of set) (v as any)[key]?.(...args);
  }
}

