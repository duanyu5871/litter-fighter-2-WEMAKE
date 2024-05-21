import React, { useState } from "react";
import './Button.css';
import './Checkbox.css';
import { useForwardedRef } from "./useForwardedRef";
import { TShortcut, useShortcut } from "./useShortcut";
export interface ICheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: boolean;
  onChanged?(v: boolean): void;
  shortcut?: TShortcut;
  shortcutTarget?: Window | Document | Element;
  show_shortcut?: boolean;
}
export const Checkbox = React.forwardRef<HTMLButtonElement, ICheckboxProps>((props: ICheckboxProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
  const {
    value, onClick, onChanged,
    shortcut,
    shortcutTarget = window,
    show_shortcut,
    className,
    ...remain_props
  } = props;
  const [_value, _set_value] = useState<boolean | undefined>(value);

  const _on_click = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    _set_value(v => !v);
    onChanged?.(!value);
  };

  const [ref_btn, on_ref] = useForwardedRef<HTMLButtonElement>(ref)
  useShortcut(shortcut, props.disabled, ref_btn, shortcutTarget);
  const root_className = className ? `lf2ui_button lf2ui_checkbox ${className}` : 'lf2ui_button lf2ui_checkbox';
  const inner_className = value ?? _value ? 'lf2ui_checkbox_inner_show' : 'lf2ui_checkbox_inner_hide'
  return (
    <button {...remain_props} className={root_className} ref={on_ref} onClick={_on_click}>
      <span className={inner_className}>✓</span>
    </button>
  );
})