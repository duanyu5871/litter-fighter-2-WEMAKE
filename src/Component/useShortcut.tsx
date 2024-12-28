import React, { useEffect, useRef } from "react";
import { is_str } from "../LF2/utils/type_check";

export type TShortcut =
  | `ctrl+shift+alt+${string}`
  | `ctrl+shift+${string}`
  | `ctrl+alt+${string}`
  | `ctrl+${string}`
  | `shift+alt+${string}`
  | `shift+${string}`
  | `alt+${string}`
  | `${string}`;

export function useShortcut(
  shortcut: string | undefined,
  disabled: any,
  fn?: () => void,
  target?: Window | Document | Element,
): void;
export function useShortcut(
  shortcut: string | undefined,
  disabled: any,
  ref_btn?: React.MutableRefObject<HTMLElement | null>,
  target?: Window | Document | Element,
): void;
export function useShortcut(
  shortcut: string | undefined,
  disabled: any,
  arg?: React.MutableRefObject<HTMLElement | null> | (() => void),
  target: Window | Document | Element = window,
): void {
  const ref_fn = useRef<() => void>();
  ref_fn.current = () => {
    if (typeof arg === "function") return arg();
    arg?.current?.focus();
    arg?.current?.click();
  };

  useEffect(() => {
    if (!shortcut || disabled) return;
    const keys = shortcut.split("+").filter((v) => v);
    if (!keys.length) return;
    const on_keydown = (e: Partial<KeyboardEvent>) => {
      if (!is_str(e.key)) return;
      const interrupt = () => {
        e.stopPropagation?.();
        e.preventDefault?.();
        e.stopImmediatePropagation?.();
      };
      if (e.ctrlKey && keys.indexOf("ctrl") < 0) return;
      if (e.shiftKey && keys.indexOf("shift") < 0) return;
      if (e.altKey && keys.indexOf("alt") < 0) return;
      if (e.key.toLowerCase() !== keys[keys.length - 1].toLowerCase()) return;
      ref_fn.current?.();
      interrupt();
    };
    target.addEventListener("keydown", on_keydown);
    return () => {
      target.removeEventListener("keydown", on_keydown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcut, !!disabled, target]);
}
