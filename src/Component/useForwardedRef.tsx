import React, { useRef } from "react";

export function useForwardedRef<V>(ref: React.Ref<V> | undefined) {
  const ref_ref = useRef<V | null>(null);
  const on_ref = (v: V | null) => {
    ref_ref.current = v;
    if (typeof ref === 'function') {
      ref(v);
    } else if (typeof ref === 'string') {
      // what?
    } else if (ref) {
      (ref as any).current = v;
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return [ref_ref, on_ref] as const;
}


