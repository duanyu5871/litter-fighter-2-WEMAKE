import { max, floor } from "../utils";

export type TValueInfo<T> =
  | { is_func: true; v: () => T }
  | { is_func: false; v: T };

export type Value<T> = T | (() => T)
export type Unsafe<T> = T | undefined | null;

export class StateDelegate<T> {
  protected _dirty: boolean = true
  protected _default_value: TValueInfo<Unsafe<T>>
  protected _values: TValueInfo<Unsafe<T>>[] = [];
  protected get_value(v: TValueInfo<Unsafe<T>>) {
    return v.is_func ? v.v() : v.v;
  }
  protected value_to_state(v: Value<Unsafe<T>>): TValueInfo<Unsafe<T>> {
    return (typeof v === 'function') ? { is_func: true, v: v as () => T } : { is_func: false, v: v };
  }
  set dirty(v: boolean) { this._dirty = v; }
  get dirty() { const r = this._dirty; this._dirty = false; return r; }
  set default_value(v: Value<T>) {
    this._default_value = this.value_to_state(v);
    if (this._values.length === 0) this._dirty = true;
  }
  get default_value(): T { return this.get_value(this._default_value)! }
  set value(v: Value<Unsafe<T>>) { this.set(max(0, this._values.length - 1), v) }
  get value(): T {
    const len = this._values.length;
    for (let i = len - 1; i >= 0; --i) {
      const item = this._values[i]!;
      const value = this.get_value(item);
      if (value !== null && value !== void 0)
        return value
    }
    return this.default_value;
  }
  constructor(default_value: Value<T>) {
    this._default_value = this.value_to_state(default_value);
  }
  set(index: number, v: Value<Unsafe<T>>): void {
    index = floor(index);
    if (index < 0) return;
    this._values[index] = this.value_to_state(v);
    if (index === this._values.length - 1) this._dirty = true;
  }

  delete(index: number) {
    index = floor(index);
    if (index < 0 || index >= this._values.length) return;
    this._values.splice(index, 1);
    if (index === this._values.length) this._dirty = true;
  }

  insert(index: number, v: Value<Unsafe<T>>): void {
    index = floor(index);
    this._values.splice(index, 0, this.value_to_state(v));
    if (index >= this._values.length - 1) this._dirty = true;
  }

  pop() {
    if (!this._values.length) return;
    this._values.pop();
    this._dirty = true;
  }

  push(...v: Value<Unsafe<T>>[]) {
    this._values.push(...v.map(v => this.value_to_state(v)));
    this._dirty = true;
  }

  unshift(...v: Value<Unsafe<T>>[]) {
    this._values.unshift(...v.map(v => this.value_to_state(v)));
  }
}
export default StateDelegate