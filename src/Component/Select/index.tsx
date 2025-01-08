import classNames from "classnames";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Clear, DropdownArrow, Tick } from "../Icons/Clear";
import { Input } from "../Input";
import Show from "../Show";
import { Space } from "../Space";
import { Tag } from "../Tag";
import { ITreeNode, TreeView } from "../TreeView";
import styles from "./styles.module.scss";

export interface IBaseSelectProps<T, V> extends Omit<React.HTMLAttributes<HTMLDivElement>, 'defaultValue'> {
  items?: readonly T[];
  auto_blur?: boolean;
  parse(item: T, idx: number, items: readonly T[]): [V, React.ReactNode];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  arrow?: React.ReactNode;
}
export interface IMultiSelectProps<T, V> extends IBaseSelectProps<T, V> {
  multi: true;
  value?: V[];
  defaultValue?: V[];
  on_changed?: (value: V[] | undefined) => void;
}
export interface ISelectProps<T, V> extends IBaseSelectProps<T, V> {
  value?: V;
  defaultValue?: V;
  on_changed?: (value: V | undefined) => void;
}
export interface IOptionData<T, V> {
  value: V;
  data: T;
  label: React.ReactNode;
}

function value_adapter<V>(defaultValue: V | V[] | undefined | null): V[] | undefined {
  if (defaultValue === null || defaultValue === void 0) return void 0
  else if (Array.isArray(defaultValue)) return defaultValue;
  return [defaultValue];
}

export function Select<T, V>(props: ISelectProps<T, V>): JSX.Element
export function Select<T, V>(props: IMultiSelectProps<T, V>): JSX.Element
export function Select<T, V>(props: ISelectProps<T, V> | IMultiSelectProps<T, V>): JSX.Element {
  const { className, items, parse, disabled, arrow, clearable, on_changed, defaultValue, ..._p } = props;
  const [open, set_open] = useState(false);
  const ref_popover = React.useRef<HTMLDivElement>(null);
  const ref_wrapper = React.useRef<HTMLDivElement>(null);
  const [gone, set_gone] = useState(false);

  const multi = (props as any).multi
  const classname = classNames(styles.lfui_dropdown, { [styles.open]: open }, className);
  const [value, set_value] = useState<V[] | undefined>(() => value_adapter(defaultValue));

  const has_value = 'value' in props
  useEffect(() => {
    if (!has_value) set_value(value_adapter(defaultValue))
  }, [defaultValue, has_value])

  const [tree_nodes, checked_tree_nodes] = useMemo(() => {
    if (!items) return [void 0, void 0];
    const checked_tree_nodes: ITreeNode<IOptionData<T, V>>[] = []
    const tree_nodes = items.map((data, idx, items) => {
      const [v, label] = parse(data, idx, items);
      const checked = value ? value.indexOf(v) >= 0 : false
      const option: ITreeNode<IOptionData<T, V>> = {
        key: "" + v,
        label: (
          <Space className={styles.option}>
            <Space.Item className={styles.label}>
              {label}
            </Space.Item>
            <Space.Broken>
              <Tick className={classNames(styles.tick, { [styles.tick_checked]: checked })} />
            </Space.Broken>
          </Space>
        ),
        data: {
          value: v,
          data,
          label,
        },
      }
      if (checked) {
        checked_tree_nodes.push(option)
      }
      return option
    })
    return [tree_nodes, checked_tree_nodes];
  }, [items, parse, value]);
  const on_click_item = (item: ITreeNode<IOptionData<T, V>>, e: React.MouseEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (item.data) {
      const { value } = item.data;
      set_value(prev => {
        if (multi) {
          let ret: typeof prev;
          if (!prev)
            ret = [value]
          else if (prev.indexOf(value) === -1)
            ret = [...prev, value]
          else
            ret = prev.filter(v => v !== value);
          ret = ret.length ? ret : void 0;
          on_changed?.(ret as any)
          return ret;
        } else {
          let ret: typeof prev;
          if (prev?.[0] === value && clearable)
            ret = void 0;
          else
            ret = [value];
          on_changed?.(ret?.at(0) as any)
          return ret;
        }
      })
    } else {
      set_value(void 0)
      on_changed?.(void 0)
    }
    if (multi) {
      set_open(false);
    }
  }

  useEffect(() => {
    if (!open && !gone) {
      const popover = ref_popover.current;
      if (!popover) return;
      popover.style.maxHeight = '0px';
      popover.style.opacity = '0'
      const tid = setTimeout(() => set_gone(true), 1000)
      return () => clearTimeout(tid);
    } else if (open && gone) {
      set_gone(false);
      return;
    }

    const wrapper = ref_wrapper.current;
    const popover = ref_popover.current;
    if (!wrapper || !popover) return;
    popover.addEventListener('pointerdown', e => e.stopPropagation())
    document.addEventListener('pointerdown', () => set_open(false), { once: true })
    const rect1 = wrapper.getBoundingClientRect();
    popover.style.left = rect1.x + 'px';
    popover.style.maxHeight = '0px';
    if (rect1.top < window.innerHeight * 0.6) {
      popover.style.top = (rect1.bottom + 5) + 'px';
      popover.style.bottom = ''
    } else {
      popover.style.top = ''
      popover.style.bottom = (window.innerHeight - rect1.top - 5) + 'px';
    }
    const rect2 = popover.getBoundingClientRect();
    if (rect2.right > window.innerWidth - 5) {
      popover.style.translate = '' + (window.innerWidth - rect2.right - 5) + 'px'
    }
    popover.style.opacity = '1';
    if (rect1.top < window.innerHeight * 0.6) {
      popover.style.maxHeight = `calc(100% - ${rect1.bottom + 25}px)`
    } else {
      popover.style.maxHeight = `${rect1.top - 10}px`;
    }

    let tid = setTimeout(() => {
      tid = setInterval(() => {
        const rect1 = wrapper.getBoundingClientRect();
        if (rect1.top < window.innerHeight * 0.6) {
          const top = `${rect1.bottom + 5}px`
          popover.style.top = top;
          popover.style.bottom = ''
          popover.style.maxHeight = `calc(100% - ${rect1.bottom + 25}px)`
        } else {
          const bottom = `${5 + window.innerHeight - rect1.top}px`
          popover.style.top = '';
          popover.style.bottom = bottom;
          popover.style.maxHeight = `${rect1.top - 25}px`;
        }
      }, 16)
    }, 300)

    const ob = new IntersectionObserver((e) => {
      if (!e[0].isIntersecting) {
        set_open(false)
      }
    })
    ob.observe(wrapper);
    return () => {
      clearTimeout(tid);
      clearInterval(tid);
      ob.disconnect();
    }
  }, [open, gone]);

  const has_outer_arrow = 'arrow' in props;
  const on_clear = (e: React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
    set_value(void 0);
  }
  const on_pointer_down = (e: React.PointerEvent) => {
    set_open(v => !v)
    e.stopPropagation()
  }
  const not_empty = !!checked_tree_nodes?.length;

  return (
    <Space className={classname} {..._p} _ref={ref_wrapper} onPointerDown={on_pointer_down}>
      <Space.Broken>
        <Input
          prefix={
            <Space className={styles.tags}>
              {
                checked_tree_nodes?.map((node, idx) => {
                  return (
                    <Tag key={idx} closeable={multi} on_close={(e) => on_click_item(node, e)}>
                      {node.data?.label}
                    </Tag>
                  )
                })
              }
            </Space>
          }
          placeholder={not_empty ? void 0 : props.placeholder}
          suffix={
            <>
              <Show.Div show={has_outer_arrow}>
                {arrow}
              </Show.Div>
              <Show show={!has_outer_arrow}>
                <DropdownArrow className={styles.arrow} />
              </Show>
            </>
          }
          className={styles.input}
          readOnly={true} />
        <Show show={clearable && value?.length}>
          <Clear className={styles.ic_clear} onPointerDown={on_clear} />
        </Show>
      </Space.Broken>
      {gone ? null : createPortal(
        <TreeView
          className={styles.lfui_dropdown_popover}
          nodes={tree_nodes}
          show_icon={false}
          on_click_item={on_click_item}
          _ref={ref_popover}
        />,
        document.body
      )}
    </Space>
  )
}

export default Select;