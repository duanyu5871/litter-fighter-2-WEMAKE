import React from "react";
import { Input, type InputProps, type InputRef } from "./_Input";

export interface InputNumberProps extends Omit<InputProps, 'type' | 'value' | 'defaultValue' | 'onChange'> {
  value?: number;
  defaultValue?: number;
  onChange?(v: number | undefined): void;
  on_blur?(v: number | undefined): void;
}
function _InputNumber(props: InputNumberProps, forwarded_Ref: React.ForwardedRef<InputRef>) {
  const { onBlur, onChange, value, on_blur, ..._p } = props;
  const _on_change = (v: string) => {
    const t = v.trim();
    onChange?.(t ? Number(t) : void 0)
  }
  const _on_blur = (e: React.FocusEvent<HTMLInputElement>) => {
    onBlur?.(e);
    const t = e.target.value.trim();
    on_blur?.(t ? Number(t) : void 0)
  }
  return <Input {..._p} type='number' ref={forwarded_Ref} onChange={_on_change} onBlur={_on_blur} />
}
export const InputNumber: React.FC<InputNumberProps & React.RefAttributes<InputRef>> = React.forwardRef<InputRef, InputNumberProps>(_InputNumber);
