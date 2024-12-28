/**
 * 异步值管理
 *
 * @export
 * @class ValuesKeeper
 * @template V
 */
export default class AsyncValuesKeeper<V> {
  readonly values = new Map<string, V>();
  protected _f_map = new Map<
    string,
    [(v: V) => void, (reason: any) => void][]
  >();

  del(key: string): void {
    this.values.delete(key);
  }

  get(key: string, job: () => Promise<V>): Promise<V> {
    if (this.values.has(key)) return Promise.resolve(this.values.get(key)!);

    return new Promise((a, b) => {
      const has_job = this._f_map.has(key);
      has_job
        ? this._f_map.get(key)?.push([a, b])
        : this._f_map.set(key, [[a, b]]);
      if (has_job) return;

      job()
        .then((v) => {
          this.values.set(key, v);
          for (const [f] of this._f_map.get(key)!) f(v);
        })
        .catch((v) => {
          for (const [, f] of this._f_map.get(key)!) f(v);
        });
    });
  }

  clean(): void {
    this._f_map.clear();
  }

  take(key: string): V | undefined {
    const ret = this.values.get(key);
    this.values.delete(key);
    return ret;
  }
}
