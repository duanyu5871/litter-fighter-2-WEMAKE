export interface IFieldProps<V> {
  value?: V;
  defaultValue?: V;
  onChange?: (v?: V) => void;
}

export function make_field_props<T, K extends keyof T>(props: IFieldProps<T>, default_value: T | undefined, key: K, edit?: (v: T) => T): IFieldProps<T[K]> {
  const { value, defaultValue = default_value, onChange } = props;

  const ret: IFieldProps<T[K]> = {
    value: value?.[key],
    defaultValue: defaultValue?.[key],
    onChange: v => {
      let next = { ...defaultValue, ...value, [key]: v } as T
      if (edit) next = edit(next);
      return onChange?.(next)
    }
  };
  if (!value || key in (value as any)) delete (ret as any).value;
  if (!defaultValue || key in (defaultValue as any)) delete (defaultValue as any).value;
  (ret as any)[`data-value`] = value?.[key];
  (ret as any)[`data-default-value`] = defaultValue?.[key];
  return ret;
}

export function make_not_blank_field_props<T, K extends keyof T>(props: IFieldProps<T>, default_value: T | undefined, key: K, edit?: (v: T) => T): IFieldProps<T[K]> {
  return make_field_props(props, default_value, key, v => {
    if (typeof v[key] === 'string' && !v[key].trim()) delete v[key];
    return edit ? edit(v) : v
  })
}