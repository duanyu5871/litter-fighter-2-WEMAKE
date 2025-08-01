import classNames from "classnames";
import device from "current-device";
import React, { useEffect, useMemo, useState } from "react";
import { IStyleProps } from "../StyleBase/IStyleProps";
import { useStyleBase } from "../StyleBase/useStyleBase";
import { useForwardedRef } from "../useForwardedRef";
import { TShortcut, useShortcut } from "../useShortcut";
import styles from "./style.module.scss";
import { Text } from "../Text";
const is_desktop = device.desktop();

export interface IButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, IStyleProps {
  shortcut?: TShortcut;
  shortcutTarget?: Window | Document | Element;
  show_shortcut?: boolean;
  actived?: boolean;
  _ref?: React.Ref<HTMLButtonElement>;
}
export function _Button(props: IButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) {
  const {
    shortcut,
    shortcutTarget = window,
    show_shortcut = true,
    actived,
    children,
    className,
    type = "button",
    variants,
    size,
    _ref,
    ..._p
  } = props;

  const [ref_btn, on_ref] = useForwardedRef(ref ?? _ref);
  useShortcut(shortcut, props.disabled, ref_btn, shortcutTarget);

  const [has_keyboard, set_has_keyboard] = useState(is_desktop);

  useEffect(() => {
    const o = () => set_has_keyboard(true);
    window.addEventListener("keydown", o, { once: true });
    return () => window.removeEventListener("keydown", o);
  }, []);

  const _show_shortcut = show_shortcut ?? has_keyboard;
  const { className: cls_name } = useStyleBase(variants);

  const root_cls_name = useMemo(() => classNames(styles.lfui_button, {
    [styles.lfui_button_actived]: actived
  }, cls_name, className), [actived, className, cls_name])

  return (
    <button className={root_cls_name} {..._p} type={type} ref={on_ref}>
      <Text size={size}>
        {children}
        {shortcut && _show_shortcut ? `(${shortcut})` : null}
      </Text>
    </button>
  );
}

_Button.default_class_name = styles.lfui_button;


export const Button = Object.assign(
  React.forwardRef(_Button),
  _Button
)
