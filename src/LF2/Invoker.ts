export default class Invoker<F extends (...args: any[]) => any = () => void> {
  protected _f_list = new Set<F>();
  add(...fn: F[]): this {
    for (const f of fn) this._f_list.add(f);
    return this;
  }
  del(...fn: F[]): this {
    for (const f of fn) this._f_list.delete(f);
    return this;
  }
  invoke(...args: Parameters<F>): ReturnType<F>[] {
    const ret: ReturnType<F>[] = []
    for (const f of this._f_list) ret.push(f(...args));
    return ret;
  }
}
