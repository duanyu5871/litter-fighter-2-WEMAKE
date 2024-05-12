import React, { useEffect } from "react";
import { is_str } from "../common/type_check/is_str";

export type TShortcut =
  `ctrl+shift+alt+${string}` |
  `ctrl+shift+${string}` |
  `ctrl+alt+${string}` |
  `ctrl+${string}` |
  `shift+alt+${string}` |
  `shift+${string}` |
  `alt+${string}` |
  `${string}`
export function useShortcut(shortcut: string | undefined, disabled: boolean | undefined, ref_btn: React.MutableRefObject<HTMLElement | null>, shortcutTarget: Window | Document | Element) {
  useEffect(() => {
    if (!shortcut || disabled) return;
    const keys = shortcut.split('+').filter(v => v);
    if (!keys.length) return;
    const on_keydown = (e: Partial<KeyboardEvent>) => {
      if (!is_str(e.key)) return;
      const interrupt = () => {
        e.stopPropagation?.();
        e.preventDefault?.();
        e.stopImmediatePropagation?.();
      };
      if (e.ctrlKey && keys.indexOf('ctrl') < 0) return;
      if (e.shiftKey && keys.indexOf('shift') < 0) return;
      if (e.altKey && keys.indexOf('alt') < 0) return;
      if (e.key.toLowerCase() !== keys[keys.length - 1].toLowerCase()) return;
      ref_btn.current?.focus();
      ref_btn.current?.click();
      interrupt();
    };
    shortcutTarget.addEventListener('keydown', on_keydown);
    return () => {
      shortcutTarget.removeEventListener('keydown', on_keydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut, disabled, shortcutTarget]);
}
