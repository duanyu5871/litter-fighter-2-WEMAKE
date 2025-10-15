/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Dispatch, type RefObject, type SetStateAction, useRef, useState } from "react";

export function useStateRef<T>(initialState: T | (() => T)): readonly [T, Dispatch<SetStateAction<T>>, RefObject<T>] {
  const [value, _set_value] = useState<T>(initialState);
  const ref_value = useRef<T>(value);
  const set_value: Dispatch<SetStateAction<T>> = (v) => {
    if (typeof v !== 'function')
      _set_value(ref_value.current = v);
    else
      _set_value(p => ref_value.current = (v as any)(p));
  };
  return [value, set_value, ref_value] as const;
}
