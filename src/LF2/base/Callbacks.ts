import { NoEmitCallbacks } from "./NoEmitCallbacks";
export class Callbacks<F> extends NoEmitCallbacks<F> {
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
      if (!set?.size) return
      for (const v of new Set(set)) (v as any)[fn_name].apply(v, args);
    }
    return ret;
  }
}

export default Callbacks