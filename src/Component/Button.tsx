import React from "react";
import { useForwardedRef } from "./useForwardedRef";
import { TShortcut, useShortcut } from "./useShortcut";
export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shortcut?: TShortcut;
  shortcutTarget?: Window | Document | Element;
}
export const Button = React.forwardRef<HTMLButtonElement, IButtonProps>(
  (props: IButtonProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const [ref_btn, on_ref] = useForwardedRef(ref)
    const { shortcut, shortcutTarget = window, ...remain_props } = props;
    useShortcut(shortcut, props.disabled, ref_btn, shortcutTarget);
    return <button {...remain_props} type={props.type ?? 'button'} ref={on_ref} />;
  }
);

