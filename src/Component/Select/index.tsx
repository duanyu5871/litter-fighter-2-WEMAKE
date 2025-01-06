import { is_num } from "../../LF2/utils/type_check";

export interface ISelectProps<T, V>
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  items?: readonly T[];
  auto_blur?: boolean;
  on_changed?: (value: V) => void;
  parse?: (item: T, idx: number, items: readonly T[]) => [V, React.ReactNode];
  placeholder?: string;
}

export default function Select<T, V>(props: ISelectProps<T, V>) {
  const {
    items,
    parse,
    auto_blur = true,
    children,
    onChange,
    on_changed,
    placeholder,
    ..._p
  } = props;
  const is_num_value = is_num(
    items?.length && parse?.(items[0], 0, items)?.[0]
  );
  const on_change: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    onChange?.(e);
    if (auto_blur) e.target.blur();
    if (on_changed) {
      const v: any = e.target.value;
      on_changed(is_num_value ? Number(v) : v);
    }
  };
  const options_children = items?.map((item, idx, items) => {
    const [v, n] = parse?.(item, idx, items) || ["" + item, "" + item];
    return (
      <option key={idx} value={"" + v}>{n}</option>
    );
  });
  return (
    <select {..._p} onChange={on_change} >
      {children}
      <option hidden />
      {options_children}
    </select>
  );
}