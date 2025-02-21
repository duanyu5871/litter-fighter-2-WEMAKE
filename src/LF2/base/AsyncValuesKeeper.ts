import { PromiseInOne } from "promise-in-one/dist/es/pio";

/**
 * 异步值管理
 *
 * @export
 * @class ValuesKeeper
 * @template V
 */
export default class AsyncValuesKeeper<V> {
  readonly values = new Map<string, V>();
  protected _pio = new PromiseInOne<string, string, V>(v => v)


  del(key: string): void {
    this.values.delete(key);
  }

  get(key: string, job: () => Promise<V>): Promise<V> {
    const value = this.values.get(key);
    if (value)
      return Promise.resolve(value);

    return new Promise((resolve, reject) => {
      const [pid, exist] = this._pio.check(key, resolve, reject)
      if (exist) return;
      this._pio.handle(pid, job().then(value => {
        this.values.set(key, value)
        return value
      }))
    });
  }

  clean(): void {
    this.values.clear()
  }

  take(key: string): V | undefined {
    const ret = this.values.get(key);
    this.values.delete(key);
    return ret;
  }
}
