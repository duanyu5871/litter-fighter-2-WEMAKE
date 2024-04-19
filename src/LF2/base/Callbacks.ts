export default class Callbacks<F> {
  readonly list = new Set<Partial<F>>();
  private _c = new Map<any, any>();
  emit<K extends keyof F>(k: K): Exclude<F[K], undefined> {
    const a = this._c.get(k);
    if (a) return a;
    const b: any = (...args: any[]) => {
      for (const i of this.list) (i[k] as any)?.(...args);
    }
    this._c.set(k, b)
    return b;
  }
  add(v: Partial<F>) {
    this.list.add(v)
    return () => { this.del(v) };
  }
  del(v: Partial<F>) {
    return this.list.delete(v);
  }
}
