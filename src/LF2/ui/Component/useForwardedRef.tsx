import React, { useRef } from "react";

export function useForwardedRef<V>(forwardedRef: React.ForwardedRef<V>) {
  const ref_btn = useRef<V | null>(null);
  const on_ref = (v: V | null) => {
    ref_btn.current = v;
    if (typeof forwardedRef === 'function')
      forwardedRef(v);
    else if (forwardedRef)
      forwardedRef.current = v;
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return [ref_btn, on_ref] as const;
}


