import { useMemo, useState } from "react";

export interface ICheckboxProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'value'> {
  value: boolean;
  onChanged?(v: boolean): void;
}
export function Checkbox(props: ICheckboxProps) {
  const { value, onClick, onChanged, style, ...remain_props } = props;
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

  return (
    <button {...remain_props} style={_style} onClick={_on_click}>
      {(value ?? _value) ? '✓' : ''}
    </button>
  );
}
