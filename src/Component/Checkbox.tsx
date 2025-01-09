import classNames from "classnames";
import React, { useState } from "react";
import { Button, IButtonProps } from "./Buttons/Button";
import styles from "./Checkbox.module.scss";
export interface ICheckboxProps extends Omit<IButtonProps, "value"> {
  value?: boolean;
  onChanged?(v: boolean): void;
}
export const Checkbox = React.forwardRef<HTMLButtonElement, ICheckboxProps>(
  (props: ICheckboxProps, ref: React.ForwardedRef<HTMLButtonElement>) => {
    const { value, onClick, onChanged, className, ...remain_props } = props;
    const [_value, _set_value] = useState<boolean | undefined>(value);
    const _on_click = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      _set_value((v) => !v);
      onChanged?.(!value);
    };
    const checked = value ?? _value;
    const root_className = classNames(styles.lf2ui_checkbox, className)
    const inner_className = classNames(styles.lf2ui_checkbox, {
      [styles.inner_show]: checked,
      [styles.inner_hide]: !checked,
    })
    return (
      <Button {...remain_props} className={root_className} onClick={_on_click} _ref={ref}>
        <span className={inner_className}>✓</span>
      </Button>
    );
  },
);
