import State_Base from "./State_Base";

export class States {
  readonly map = new Map<number | string, State_Base>();
  get(key: number | string) {
    return this.map.get(key);
  }
  set(key: number | string, value: State_Base) {
    if (this.map.has(key)) debugger;
    if (typeof key === 'number')
      value.state = key;
    this.map.set(key, value);
  }
  add(...values: State_Base[]): this {
    for (const value of values) {
      this.map.set(value.state, value);
    }
    return this;
  }
  set_in_range(from: number, to: number, create: (key: number) => State_Base) {
    for (let key = from; key <= to; ++key) {
      const value = create(key);
      this.set(key, value)
    }
  }
  set_all_of(keys: (number | string)[], create: (key: number | string) => State_Base) {
    for (const key of keys) {
      const value = create(key);
      this.set(key, value)
    }
  }
}
export default States