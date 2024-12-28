/**
 * 函数批量调用器
 *
 * @export
 * @class Invoker
 * @template {(...args: any[]) => any} [F=() => void]
 */
export default class Invoker<F extends (...args: any[]) => any = () => void> {
  protected _f_list = new Set<F>();

  /**
   * 添加函数
   *
   * @param {...(F| undefined | null)[]} fn 函数
   * @returns {this}
   */
  add(...fn: (F | undefined | null)[]): this {
    for (const f of fn) f && this._f_list.add(f);
    return this;
  }

  /**
   * 移除函数
   *
   * @param {...F[]} fn
   * @returns {this}
   */
  del(...fn: F[]): this {
    for (const f of fn) this._f_list.delete(f);
    return this;
  }

  /**
   * 调用
   *
   * @param {...Parameters<F>} args
   * @returns {ReturnType<F>[]}
   */
  invoke(...args: Parameters<F>): ReturnType<F>[] {
    const ret: ReturnType<F>[] = [];
    for (const f of this._f_list) ret.push(f(...args));
    return ret;
  }

  /**
   * 清空
   *
   * @returns {this}
   */
  clear(): this {
    this._f_list.clear();
    return this;
  }

  invoke_and_clear(...args: Parameters<F>): void {
    this.invoke(...args);
    this.clear();
  }

  clear_fn = () => {
    this.clear();
  };
}
