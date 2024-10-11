import React, { useEffect, useState } from "react";
import { useForwardedRef } from "./useForwardedRef";
import { TShortcut, useShortcut } from "./useShortcut";
import device from 'current-device';
import './Button.css'
const is_desktop = device.desktop();

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shortcut?: TShortcut;
  shortcutTarget?: Window | Document | Element;
  show_shortcut?: boolean;
  _ref?: React.Ref<HTMLButtonElement>;
}
export function Button(props: IButtonProps) {
  const {
    shortcut,
    shortcutTarget = window,
    show_shortcut = true,
    children,
    className,
    type = 'button',
    _ref,
    ..._p
  } = props;

  const [ref_btn, on_ref] = useForwardedRef(_ref)
  useShortcut(shortcut, props.disabled, ref_btn, shortcutTarget);

  const [has_keyboard, set_has_keyboard] = useState(is_desktop)

  useEffect(() => {
    const o = () => set_has_keyboard(true)
    window.addEventListener('keydown', o, { once: true })
    return () => window.removeEventListener('keydown', o)
  }, [])

  const _show_shortcut = show_shortcut ?? has_keyboard
  const root_className = className ? `lf2ui_button ${className}` : 'lf2ui_button'
  return (
    <button className={root_className} {..._p} type={type} ref={on_ref} >
      {children}
      {shortcut && _show_shortcut ? `(${shortcut})` : null}
    </button>
  );

}

