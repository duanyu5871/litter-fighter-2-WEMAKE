import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button, IButtonProps } from "./Button";
import "./Button.scss";
import { TShortcut } from "./useShortcut";

export interface IStatusItem<V = any> {
  value: V;
  label: React.ReactNode;
}
export interface IStatusButtonProps<V = any>
  extends Omit<IButtonProps, "children" | "value" | "onChange"> {
  value?: V;
  items?: IStatusItem<V>[];
  onChange?(v: V | undefined): void;
  shortcut?: TShortcut;
  shortcutTarget?: Window | Document | Element;
  show_shortcut?: boolean;
  _ref?: React.Ref<HTMLButtonElement>;
}

export function StatusButton<V = any>(props: IStatusButtonProps<V>) {
  const { value, onClick, onChange, items, ..._p } = props;

  const ref_value = useRef(value);
  const ref_onChange = useRef(onChange);
  const [_inner_value, _set_inner_value] = useState(value);
  ref_value.current = value ?? _inner_value;
  ref_onChange.current = onChange ?? _set_inner_value;

  const _onClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      onClick?.(e);
      const value = ref_value.current;
      const onChange = ref_onChange.current;
      if (!items) {
        onChange?.(value);
        return;
      }
      const next_index =
        (items.findIndex((v) => v.value === value) + 1) % items.length;
      onChange?.(items[next_index]?.value);
    },
    [onClick, items],
  );

  const label = useMemo(
    () => items?.find((v) => v.value === value)?.label,
    [items, value],
  );
  return (
    <Button {..._p} onClick={_onClick}>
      {" "}
      {label}{" "}
    </Button>
  );
}
