import classNames from "classnames";
import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import "./Input.scss";

export type BaseProps = React.InputHTMLAttributes<HTMLInputElement>
export interface InputProps extends Omit<BaseProps, 'prefix'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  clear_icon?: React.ReactNode;
  clearable?: boolean;
  clazz?: {
    suffix?: string;
    prefix?: string;
    input?: string;
    icon?: string;
  }
}
export interface InputRef {
  readonly input: HTMLInputElement | null;
  value: string | undefined;
}
function _Input(props: InputProps, forwarded_Ref: React.ForwardedRef<InputRef>) {
  const { className, prefix, suffix, clear_icon = '×', clazz, clearable = true, ..._p } = props;
  const root_cls_name = classNames('lf2ui_input', className);
  const prefix_cls_name = classNames('lf2ui_input_prefix', clazz?.prefix);
  const input_cls_name = classNames('lf2ui_input_input', clazz?.input);
  const suffix_cls_name = classNames('lf2ui_input_suffix', clazz?.suffix);
  const clear_icon_cls_name = classNames('lf2ui_input_clear_icon', clazz?.icon);

  const ref_input = useRef<HTMLInputElement>(null);
  const ref_root = useRef<HTMLSpanElement>(null);
  const ref_icon = useRef<HTMLButtonElement>(null);
  const [is_empty, set_is_emtpy] = useState<boolean>(!!props.value || !!props.defaultValue);

  useMemo<InputRef>(() => {
    const ret = {
      get input() { return ref_input.current },
      get value() { return ref_input.current?.value },
      set value(v) { if (ref_input.current) ref_input.current.value = v ?? '' }
    };
    if (typeof forwarded_Ref === 'function') {
      forwarded_Ref(ret)
    } else if (forwarded_Ref) {
      forwarded_Ref.current = ret;
    }
    return ret;
  }, [forwarded_Ref])

  useEffect(() => {
    const ele_root = ref_root.current;
    const ele_input = ref_input.current;
    if (!ele_root || !ele_input) return;
    const on_root_pointerdown = (e: PointerEvent) => {
      if (e.target !== ele_input)
        setTimeout(() => ele_input.focus(), 1)
    }
    ele_root.addEventListener('pointerdown', on_root_pointerdown)

    const on_input_change = () => set_is_emtpy(!!ele_input.value.length)
    ele_input.addEventListener('input', on_input_change)

    return () => {
      ele_root.removeEventListener('pointerdown', on_root_pointerdown)
      ele_input.removeEventListener('input', on_input_change)
    }
  }, []);

  const on_click_clear = () => {
    const ele = ref_input.current;
    if (ele) {
      const { set } = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value") || {};
      if (set) {
        set?.call(ele, '');
      } else {
        ele.value = ''
      }
      const ev = new InputEvent('input', { bubbles: true });
      (ev as any).simulated = true;
      ele.dispatchEvent(ev);
    }
  }

  return (
    <span className={root_cls_name} ref={ref_root}>
      {prefix ? <span className={prefix_cls_name}>{prefix}</span> : null}
      <input className={input_cls_name} ref={ref_input} {..._p} />
      {suffix ? <span className={suffix_cls_name}>{suffix}</span> : null}
      {
        !(!is_empty && clearable && clear_icon) ? null :
          <button className={clear_icon_cls_name} ref={ref_icon} tabIndex={-1}
            onClick={on_click_clear}>
            {clear_icon}
          </button>
      }
    </span>
  )
}

export const Input = React.forwardRef<InputRef, InputProps>(_Input)