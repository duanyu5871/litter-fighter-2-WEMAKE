export type TStateValueInfo<T> =
  | { is_func: true; v: () => T }
  | { is_func: false; v: T };
export default class StateDelegate<T> {
  protected _default_value: TStateValueInfo<T>;
  protected _values: (TStateValueInfo<T> | undefined)[] = [];
  protected state_to_value(v: TStateValueInfo<T>) {
    return v.is_func ? v.v() : v.v;
  }
  protected value_to_state(v: T | (() => T)): TStateValueInfo<T> {
    return (typeof v === 'function') ? { is_func: true, v: v as () => T } : { is_func: false, v: v };
  }

  get value(): T {
    for (const val of this._values)
      if (val !== void 0) return this.state_to_value(val);
    return this.state_to_value(this._default_value);
  }
  get default_value(): T {
    return this.state_to_value(this._default_value);
  }

  set default_value(v: T | (() => T)) {
    this._default_value = this.value_to_state(v);
  }

  constructor(default_value: () => T);
  constructor(default_value: T);
  constructor(default_value: T | (() => T)) {
    this._default_value = this.value_to_state(default_value);
  }

  set(index: number, v: T | (() => T)) {
    this._values[index] = this.value_to_state(v);
  }
}
