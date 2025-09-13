export interface IFieldProps<V> {
  value?: V;
  defaultValue?: V;
  onChange?: (v?: V) => void;
}
export function make_field_props<T, K extends keyof T>(props: IFieldProps<T>, default_value: T | undefined, key: K): IFieldProps<T[K]> {
  const { value, defaultValue = default_value, onChange } = props;

  const ret: IFieldProps<T[K]> = {
    value: value?.[key],
    defaultValue: defaultValue?.[key],
    onChange: v => onChange?.({ ...defaultValue, ...value, [key]: v } as T)
  };
  if(!value || key in (value as any)) delete (ret as any).value;
  if(!defaultValue || key in (defaultValue as any)) delete (defaultValue as any).value;


  (ret as any)[`data-value`] = value?.[key];
  (ret as any)[`data-default-value`] = defaultValue?.[key];
  return ret;
}
