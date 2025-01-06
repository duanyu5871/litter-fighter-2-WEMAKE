import classNames from "classnames";
import styles from "./styles.module.scss";
import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ITreeNode, ITreeNodeOnClick, TreeView } from "../TreeView";
import { Space } from "../Space";

export interface IDropdownProps<T, V> extends React.HTMLAttributes<HTMLDivElement> {
  value?: V;
  items?: readonly T[];
  auto_blur?: boolean;
  on_changed?: (value: V) => void;
  parse(item: T, idx: number, items: readonly T[]): [V, React.ReactNode];
  placeholder?: string;
  disabled?: boolean;
}

interface ITreeNodeData<T, V> {
  value: V;
  data: T;
  label: React.ReactNode;
}
export function Dropdown<T, V>(props: IDropdownProps<T, V>) {
  const { className, items, parse, disabled, ..._p } = props;
  const classname = classNames(styles.lfui_dropdown, className);
  const [value, set_value] = useState<V[]>();
  const [open, set_open] = useState(false);

  const [tree_nodes, checked_tree_nodes] = useMemo(() => {
    if (!items) return [void 0, void 0];
    const checked_tree_nodes: ITreeNode<ITreeNodeData<T, V>>[] = []
    const tree_nodes = items.map((data, idx, items) => {
      const [v, label] = parse(data, idx, items);
      const checked = value ? value.indexOf(v) >= 0 : false
      const option: ITreeNode<ITreeNodeData<T, V>> = {
        key: "" + v,
        label: (<Space> {label} </Space>),
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


  const on_click_item: ITreeNodeOnClick<ITreeNodeData<T, V>> = (item) => {
    if (item.data) {
      set_value([item.data.value])
    } else {
      set_value(void 0)
    }
  }
  const ref_popover = React.useRef<HTMLDivElement>(null);
  const ref_wrapper = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = ref_wrapper.current;
    const popover = ref_popover.current;
    if (!popover || !wrapper || !open) return;
    popover.addEventListener('pointerdown', e => e.stopPropagation())
    document.addEventListener('pointerdown', () => set_open(false), { once: true })
    const tid = setInterval(() => {
      const rect1 = wrapper.getBoundingClientRect();
      popover.style.left = rect1.x + 'px';
      popover.style.top = (rect1.bottom + 5) + 'px';
      popover.style.opacity = '1';
    }, 16)
    return () => clearInterval(tid)
  }, [open]);

  useEffect(() => {
    const wrapper = ref_wrapper.current;
    if (disabled) set_open(false);
    if (!wrapper || disabled) return;
    const wrapper_click = () => set_open(v => !v)
    wrapper.addEventListener('click', wrapper_click)
    wrapper.addEventListener('pointerdown', e => e.stopPropagation())
    return () => wrapper.removeEventListener('click', wrapper_click)
  }, [disabled])

  return (
    <div className={classname} {..._p} ref={ref_wrapper}>
      {checked_tree_nodes?.map(node => {
        return node.label
      })}
      {
        open ?
          createPortal(
            <TreeView
              className={styles.lfui_dropdown_popover}
              nodes={tree_nodes}
              show_icon={false}
              on_click_item={on_click_item}
              _ref={ref_popover}
            />,
            document.body
          ) : null
      }
    </div>
  )
}