import type Entity from "../entity/Entity";
import State_Base from "./State_Base";

export class States<E extends Entity = Entity> {
  readonly map = new Map<number, State_Base<E>>();
  get(key: number) {
    return this.map.get(key);
  }
  set(key: number, value: State_Base<E>) {
    if(this.map.has(key)) debugger;
    value.state = key;
    this.map.set(key, value);
  }
  add(...values: State_Base<E>[]): this {
    for (const value of values) {
      this.map.set(value.state, value);
    }
    return this;
  }
  set_in_range(from: number, to: number, create: (key: number) => State_Base<E>) {
    for (let key = from; key <= to; ++key) {
      const value = create(key);
      this.set(key, value)
    }
  }
}
export default States