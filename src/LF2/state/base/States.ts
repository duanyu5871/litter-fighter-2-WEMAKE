import type Entity from "../../entity/Entity";
import BaseState from "./BaseState";

export class States<E extends Entity = Entity> {
  readonly map = new Map<number, BaseState<E>>();
  get(key: number) {
    return this.map.get(key);
  }
  set(key: number, value: BaseState<E>) {
    if (value.state === -1) value.state = key;
    this.map.set(key, value);
  }
  add(...values: BaseState<E>[]): this {
    for (const value of values) {
      this.map.set(value.state, value);
    }
    return this;
  }
  set_in_range(from: number, to: number, create: (key: number) => BaseState<E>) {
    for (let key = from; key <= to; ++key) {
      const value = create(key);
      this.set(key, value)
    }
  }
}
export default States