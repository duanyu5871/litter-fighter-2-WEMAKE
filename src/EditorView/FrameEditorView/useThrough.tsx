import { useRef } from "react";

export function useThrough<F extends (...args: any[]) => any>(func: F | undefined | null, mine: F): F {
  const ref_func = useRef(func);
  ref_func.current = func;
  const ret: F = ((...args: Parameters<F>) => {
    ref_func.current?.(...args);
    return mine(...args);
  }) as F;
  return ret;
}
