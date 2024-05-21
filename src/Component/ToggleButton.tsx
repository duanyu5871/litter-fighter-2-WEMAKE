import device from 'current-device';
import React, { useEffect, useRef, useState } from "react";
import { useForwardedRef } from "./useForwardedRef";
import { TShortcut, useShortcut } from "./useShortcut";
const is_desktop = device.desktop();


export interface IToggleButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  checked?: boolean;
  children?: [React.ReactNode, React.ReactNode] | [React.ReactNode];
  onToggle?(v: boolean): void;
  shortcut?: TShortcut;
  shortcutTarget?: Window | Document | Element;
  show_shortcut?: boolean;
};
export const ToggleButton = React.forwardRef<HTMLButtonElement, IToggleButtonProps>(
  (props: IToggleButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const {
      children = [],
      checked, onClick, onToggle,
      shortcut,
      shortcutTarget = window,
      show_shortcut,
      ...remain_props
    } = props;

    const [ref_btn, on_ref] = useForwardedRef<HTMLButtonElement>(ref)

    const ref_checked = useRef(checked);
    ref_checked.current = checked;

    const ref_onToggle = useRef(onToggle);
    ref_onToggle.current = onToggle;

    const checked_inner = children[1] ?? children[0];
    const unchecked_inner = children[0];
    const _onClick: typeof onClick = e => {
      onClick?.(e);
      onToggle?.(!checked);
    };
    useShortcut(shortcut, props.disabled, ref_btn, shortcutTarget);

    const [has_keyboard, set_has_keyboard] = useState(is_desktop)

    useEffect(() => {
      const o = () => set_has_keyboard(true)
      window.addEventListener('keydown', o, { once: true })
      return () => window.removeEventListener('keydown', o)
    }, [])

    const _show_shortcut = show_shortcut ?? has_keyboard

    return (
      <button
        {...remain_props}
        type={props.type ?? 'button'}
        ref={on_ref}
        onClick={_onClick}>
        {checked ? checked_inner : unchecked_inner}
        {shortcut && _show_shortcut ? `(${shortcut})` : null}
      </button>
    );
  }
);
