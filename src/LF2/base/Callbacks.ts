import { NoEmitCallbacks } from "./NoEmitCallbacks";
const EFUNC = (..._args: any[]) => void 0
export class Callbacks<F extends {}> extends NoEmitCallbacks<F> {
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
      for (const v of set) {
        const f = (v as any)[fn_name];
        f.apply(v, args);
        if ('once' in v && v.once) set.delete(f)
      }
    };
    return ret;
  }
}
export default Callbacks;
