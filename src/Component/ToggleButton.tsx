import React, { useMemo, useState } from "react";
import "./Button.scss";
import { IStatusButtonProps, IStatusItem, StatusButton } from "./StatusButton";

export interface IToggleButtonProps
  extends Omit<IStatusButtonProps<boolean>, "onChange"> {
  children?:
  | [React.ReactNode, React.ReactNode]
  | [React.ReactNode]
  | React.ReactNode;
  onChange?: (v: boolean) => void;
}
export function ToggleButton(props: IToggleButtonProps) {
  const { children, onChange, items, value, ..._p } = props;
  const [v, set_v] = useState(false)
  const _items = useMemo<IStatusItem<boolean>[]>(() => {
    if (items) return items;
    if (Array.isArray(children)) {
      const [a, b = a] = children;
      return [
        { value: false, label: a },
        { value: true, label: b },
      ];
    }
    return [
      { value: false, label: children },
      { value: true, label: children },
    ];
  }, [items, children]);

  return (
    <StatusButton
      {..._p}
      items={_items}
      value={value ?? v}
      onChange={(v) => (onChange ?? set_v)(!!v)} />
  );
}
