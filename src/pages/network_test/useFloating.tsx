import { useEffect, useRef } from "react";
import { clamp } from "../../LF2/utils";

export interface IUseFloatingOpts {
  responser?: HTMLElement | null;
  target?: HTMLElement | null;
  is_excluded?(e: HTMLElement): boolean;
}
export function useFloating(opts: IUseFloatingOpts) {
  const { responser, target = responser, is_excluded } = opts;

  const ref_is_excluded = useRef(is_excluded)
  ref_is_excluded.current = is_excluded;
  useEffect(() => {
    if (!responser) return;
    if (!target) return;
    let offset_x = 0;
    let offset_y = 0;
    const pointerdown = (e: PointerEvent) => {
      if (ref_is_excluded.current?.(e.target as HTMLElement)) return;
      const { x, y } = target.getBoundingClientRect();
      offset_x = x - e.clientX;
      offset_y = y - e.clientY;
      document.addEventListener('pointermove', pointermove);
      document.addEventListener('pointerup', pointerup);
      document.addEventListener('pointercancel', pointerup);
    };
    const pointermove = (e: PointerEvent) => {
      const { width, height } = target.getBoundingClientRect();
      const x = clamp(e.clientX + offset_x, 0, window.innerWidth - width)
      const y = clamp(e.clientY + offset_y, 0, window.innerHeight - height)
      target.style.left = (x) + 'px';
      target.style.top = (y) + 'px';
      target.style.bottom = target.style.right = 'unset'
    };
    const on_resize = () => {
      let { x, y, width, height } = target.getBoundingClientRect();
      x = clamp(x, 0, window.innerWidth - width)
      y = clamp(y, 0, window.innerHeight - height)
      target.style.left = (x) + 'px';
      target.style.top = (y) + 'px';
      target.style.bottom = target.style.right = 'unset'
    }
    const pointerup = (e: PointerEvent) => {
      document.removeEventListener('pointermove', pointermove);
      document.removeEventListener('pointerup', pointerup);
      document.removeEventListener('pointercancel', pointerup);
    };
    responser.addEventListener('pointerdown', pointerdown);
    const resize_ob = new ResizeObserver(on_resize)
    resize_ob.observe(target)
    window.addEventListener('resize', on_resize)
    return () => {
      window.removeEventListener('resize', on_resize)
      responser.removeEventListener('pointerdown', pointerdown);
      document.removeEventListener('pointermove', pointermove);
      document.removeEventListener('pointerup', pointerup);
      document.removeEventListener('pointercancel', pointerup);
      resize_ob.disconnect()
    };
  }, [responser, target]);
}
