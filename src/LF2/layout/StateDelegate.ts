export type TValueInfo<T> =
  | { is_func: true; v: () => T }
  | { is_func: false; v: T };

export type Value<T> = T | (() => T)
export type Unsafe<T> = T | undefined | null;
export class StateDelegate<T> {
  protected _values: TValueInfo<Unsafe<T>>[] = [];
  protected get_value(v: TValueInfo<Unsafe<T>>) {
    return v.is_func ? v.v() : v.v;
  }
  protected value_to_state(v: Value<Unsafe<T>>): TValueInfo<Unsafe<T>> {
    return (typeof v === 'function') ? { is_func: true, v: v as () => T } : { is_func: false, v: v };
  }
  set default_value(v: Value<T>) {
    this.set(0, v);
  }
  get default_value(): T {
    return this.get_value(this._values[0])!;
  }
  set value(v: Value<Unsafe<T>>) {
    this.set(Math.min(1, this._values.length - 1), v);
  }
  get value(): T {
    const len = this._values.length;
    for (let i = len - 1; i > 0; --i) {
      const value = this.get_value(this._values[i]);
      if (value !== null && value !== void 0)
        return value
    }
    return this.default_value;
  }
  constructor(default_value: Value<T>) {
    this._values[0] = this.value_to_state(default_value);
  }

  set(index: 0, v: Value<T>): void;
  set(index: number, v: Value<Unsafe<T>>): void;
  set(index: number, v: Value<Unsafe<T>>): void {
    this._values[index] = this.value_to_state(v);
  }

  delete(index: number) {
    if (index === 0) throw new Error("[StateDelegate] delete(0) is not allowed.")
    this._values.splice(index, 1);
  }

  insert(index: 0, v: Value<T>): void;
  insert(index: number, v: Value<Unsafe<T>>): void;
  insert(index: number, v: Value<Unsafe<T>>): void {
    this._values.splice(index, 0, this.value_to_state(v));
  }
  pop() {
    this._values.pop();
  }
  push(v: Value<Unsafe<T>>[]) {
    this._values.push(...v.map(v => this.value_to_state(v)));
  }
}
export default StateDelegate