export class NoEmitCallbacks<F> {
  protected _map = new Map<any, Set<Partial<F>>>();

  add(v: Partial<F>, keys?: (keyof F)[]): () => void {
    const any_keys: any[] = keys?.length ? keys : ['']
    for (const key of any_keys) {
      let set = this._map.get(key);
      if (!set) this._map.set(key, set = new Set())
      set.add(v);
    }
    return () => { this.del(v) };
  }

  del(v: Partial<F>): void {
    for (const [, set] of this._map) set.delete(v);
  }
}
export default class Callbacks<F> extends NoEmitCallbacks<F> {
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

