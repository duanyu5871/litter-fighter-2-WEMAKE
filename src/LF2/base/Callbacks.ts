import { NoEmitCallbacks } from "./NoEmitCallbacks";
const EFUNC = (..._args: any[]) => void 0
export class Callbacks<F extends {}> extends NoEmitCallbacks<F> {
  count = 0;
  /**
   * 获取指定回调名的回调函数
   *
   * @template {keyof F} K
   * @param {K} fn_name
   * @returns {Exclude<F[K], undefined | null>} 指定回调名的回调函数
   */
  emit<K extends keyof F>(fn_name: K): Exclude<F[K], undefined | null> {
    const set = this._map.get(fn_name);
    if (!set || !set.size) return EFUNC as any;
    const ret: any = (...args: any[]) => {
      const current_set = new Set(set);
      this.count = 0;
      // 避免当前循环添加的回调被出发
      for (const v of current_set) {
        const f = (v as any)[fn_name];
        f.apply(v, args);
        if ('once' in v && v.once) set.delete(f)
        ++this.count;
      }
    };
    return ret;
  }
}
export default Callbacks;
