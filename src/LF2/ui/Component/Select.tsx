import { useMemo } from "react";
import { is_num } from "../../../js_utils/is_num";
import { WTF } from "./_no_id";

export interface ISelectProps<T, V> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  items?: readonly T[];
  auto_blur?: boolean;
  on_changed?: (value: V) => void;
  option?: (item: T, idx: number, items: readonly T[]) => [V, React.ReactNode];
}

export default function Select<T, V>(props: ISelectProps<T, V>) {
  const {
    items,
    option,
    auto_blur = true,
    children,
    onChange,
    on_changed: onChanged,
    ...remain_props
  } = props;
  const default_id = useMemo(() => 'no_id_select_' + WTF.new_id(), [])
  const is_num_value = is_num(items?.length && option?.(items[0], 0, items)?.[0]);
  const on_change: React.ChangeEventHandler<HTMLSelectElement> = e => {
    onChange?.(e);
    if (auto_blur) e.target.blur();
    if (onChanged) {
      const v: any = e.target.value;
      onChanged(is_num_value ? Number(v) : v)
    }
  }
  const options_children = items?.map((item, idx, items) => {
    const [v, n] = option?.(item, idx, items) || ['' + item, '' + item]
    return (<option key={idx} value={'' + v}> {n} </option>)
  })
  return <select id={default_id} {...remain_props} onChange={on_change}>{children}{options_children}</select>
}