import classNames from "classnames";
import React, { useEffect, useMemo, useRef } from "react";
import { Clear } from "../Icons/Clear";
import styles from "./styles.module.scss";

export type BaseProps = React.InputHTMLAttributes<HTMLInputElement>
export interface InputProps extends Omit<BaseProps, 'prefix' | 'step'> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  clear_icon?: React.ReactNode;
  clearable?: boolean;
  step?: number;
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

function direct_set_value(ele: HTMLInputElement | null, value: string | number) {
  if (!ele) return;
  const { set } = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value") || {};
  if (set) {
    set?.call(ele, '' + value);
  } else {
    ele.value = '' + value;
  }
  const ev = new InputEvent('input', { bubbles: true });
  (ev as any).simulated = true;
  ele.dispatchEvent(ev);
}

function _Input(props: InputProps, forwarded_Ref: React.ForwardedRef<InputRef>) {
  const {
    className, prefix, suffix, clear_icon = <Clear hoverable />, style, clazz,
    clearable = false,
    ..._p
  } = props;

  const { type, step, min, max } = props;
  const need_steppers = !!(step && type === 'number');
  const need_clearer = !!(clearable && clear_icon);
  const root_cls_name = classNames(styles.lfui_input, className);
  const prefix_cls_name = classNames(styles.lfui_input_prefix, clazz?.prefix);
  const input_cls_name = classNames(styles.lfui_input_input, clazz?.input);
  const suffix_cls_name = classNames(styles.lfui_input_suffix, {
    [styles.lfui_input_suffix_spacer]: need_clearer || need_steppers
  }, clazz?.suffix);
  const clear_icon_cls_name = classNames(styles.lfui_input_clear_icon, clazz?.icon);

  const ref_input = useRef<HTMLInputElement>(null);
  const ref_root = useRef<HTMLDivElement>(null);
  const ref_spacer = useRef<HTMLSpanElement>(null);
  const ref_icon = useRef<HTMLButtonElement>(null);

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

  const { defaultValue, placeholder } = props;
  const has_value = ('value' in props)

  useEffect(() => {
    if (has_value) return;
    if (!ref_input.current) return;
    if (!ref_spacer.current) return;
    const _defaultValue = typeof defaultValue === 'string' ? defaultValue : '';
    const _placeholder = typeof placeholder === 'string' ? placeholder : ''
    ref_input.current.value = _defaultValue;
    ref_spacer.current.innerText = _defaultValue.length > _placeholder.length ? _defaultValue : _placeholder;
  }, [defaultValue, has_value, placeholder])

  useEffect(() => {
    const ele_root = ref_root.current;
    const ele_input = ref_input.current;
    if (!ele_root || !ele_input) return;
    const on_root_pointerdown = (e: PointerEvent) => {
      if (e.target !== ele_input)
        setTimeout(() => ele_input.focus(), 1)
    }
    ele_root.addEventListener('pointerdown', on_root_pointerdown)
    const on_input_change = () => {
      const ele = ref_icon.current;
      if (!ele) return;
      ele.style.display = ele_input.value.length ? '' : 'none';
    }
    const on_value_change = () => {
      const ele = ref_spacer.current;
      if (!ele) return;

      ele.innerText = ele_input.value.length > ele_input.placeholder.length ? ele_input.value : ele_input.placeholder;
    }
    on_value_change();
    on_input_change();
    ele_input.addEventListener('input', on_input_change)
    ele_input.addEventListener('input', on_value_change)
    ele_input.addEventListener('change', on_value_change)
    return () => {
      ele_root.removeEventListener('pointerdown', on_root_pointerdown)
      ele_input.removeEventListener('input', on_input_change)
      ele_input.removeEventListener('input', on_value_change)
      ele_input.removeEventListener('change', on_value_change)
    }
  }, [clearable]);

  const add_step = (direction: -1 | 1) => {
    if (!step) return;
    const ele = ref_input.current;
    const num = Number(ref_input.current?.value);
    const num_min = Number(min)
    const num_max = Number(max)
    const num_step = step * direction
    if (Number.isNaN(num)) {
      if (num_step > 0) {
        if (Number.isNaN(num_min)) {
          direct_set_value(ele, '0')
        } else {
          direct_set_value(ele, num_min)
        }
      } else if (Number.isNaN(num_max)) {
        direct_set_value(ele, '0')
      } else {
        direct_set_value(ele, num_max)
      }
    } else if (!Number.isNaN(num_min) && num + num_step < num_min) {
      direct_set_value(ele, num_min)
    } else if (!Number.isNaN(num_max) && num + num_step > num_max) {
      direct_set_value(ele, num_max)
    } else {
      direct_set_value(ele, num + num_step)
    }
  }

  const ref_tid = useRef<number>(0);


  const steppers = !need_steppers ? null :
    <span className={styles.stepper}>
      <svg xmlns="http://www.w3.org/2000/svg"
        width={12}
        height={5}
        viewBox="0, 0, 12, 5"
        onClick={() => add_step(1)}
        onPointerDown={e => {
          window.clearTimeout(ref_tid.current)
          window.clearInterval(ref_tid.current)
          ref_tid.current = window.setTimeout(() => {
            window.clearTimeout(ref_tid.current)
            window.clearInterval(ref_tid.current)
            ref_tid.current = window.setInterval(() => {
              add_step(1)
            }, 50)
          }, 500)
        }}
        onPointerCancel={() => {
          window.clearTimeout(ref_tid.current)
          window.clearInterval(ref_tid.current)
        }}
        onPointerUp={() => {
          window.clearTimeout(ref_tid.current)
          window.clearInterval(ref_tid.current)
        }}
        onPointerOut={() => {
          window.clearTimeout(ref_tid.current)
          window.clearInterval(ref_tid.current)
        }}>
        <path d="M 2 5 L 6 1 L 10 5" stroke="currentColor" fill="none" strokeWidth={1} />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg"
        width={12}
        height={5}
        viewBox="0, 0, 12, 5"
        onClick={() => add_step(-1)}
        onPointerDown={e => {
          window.clearTimeout(ref_tid.current)
          window.clearInterval(ref_tid.current)
          ref_tid.current = window.setTimeout(() => {
            window.clearTimeout(ref_tid.current)
            window.clearInterval(ref_tid.current)
            ref_tid.current = window.setInterval(() => {
              add_step(-1)
            }, 100)
          }, 500)
        }}
        onPointerCancel={() => {
          window.clearTimeout(ref_tid.current)
          window.clearInterval(ref_tid.current)
        }}
        onPointerUp={() => {
          window.clearTimeout(ref_tid.current)
          window.clearInterval(ref_tid.current)
        }}
        onPointerOut={() => {
          window.clearTimeout(ref_tid.current)
          window.clearInterval(ref_tid.current)
        }}>
        <path d="M 2 0 L 6 4 L 10 0" stroke="currentColor" fill="none" strokeWidth={1} />
      </svg>
    </span>

  const icon = !need_clearer ? null :
    <button className={clear_icon_cls_name} ref={ref_icon} tabIndex={-1}
      onClick={() => direct_set_value(ref_input.current, '')}>
      {clear_icon}
    </button>

  if ('value' in _p && _p.value === void 0) _p.value = ""
  return (
    <div className={root_cls_name} ref={ref_root} style={style}>
      {prefix ? <span className={prefix_cls_name}>{prefix}</span> : null}
      <div className={styles.lfui_input_spacer}>
        <span ref={ref_spacer} />
        <input className={input_cls_name} ref={ref_input} {..._p} />
      </div>
      <span className={suffix_cls_name}>{suffix}</span>
      <span className={styles.fix_right_zone}>
        {icon}
        {steppers}
      </span>
    </div>
  )
}

export const Input = React.forwardRef<InputRef, InputProps>(_Input)


export interface InputNumberProps extends Omit<InputProps, 'type' | 'value' | 'defaultValue'> {
  value?: number;
  defaultValue?: number;
  on_change?(v: number | undefined): void
}
function _InputNumber(props: InputNumberProps, forwarded_Ref: React.ForwardedRef<InputRef>) {
  const { onChange, on_change, ..._p } = props;
  const _on_change = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange?.(e);
    const t = e.target.value.trim();
    on_change?.(t ? void 0 : Number(e.target.value))
  }
  return <Input {..._p} type='number' ref={forwarded_Ref} onChange={_on_change} />
}

export const InputNumber = React.forwardRef<InputRef, InputNumberProps>(_InputNumber)