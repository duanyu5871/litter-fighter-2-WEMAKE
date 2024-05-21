import React, { useMemo, useState } from "react";
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
    value, onClick, onChanged, style,
    shortcut,
    shortcutTarget = window,
    show_shortcut,
    ...remain_props
  } = props;
  const [_value, _set_value] = useState<boolean | undefined>(value);

  const _on_click = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    _set_value(v => !v);
    onChanged?.(!value);
  };
  const _style: React.CSSProperties = useMemo(() => {
    return {
      width: 15,
      height: 15,
      minWidth: 15,
      minHeight: 15,
      padding: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    };
  }, [style]);

  const [ref_btn, on_ref] = useForwardedRef<HTMLButtonElement>(ref)
  useShortcut(shortcut, props.disabled, ref_btn, shortcutTarget);

  return (
    <button {...remain_props} style={_style} ref={on_ref} onClick={_on_click}>
      {(value ?? _value) ? '✓' : ''}
    </button>
  );
})