import { Entity } from "../entity/Entity";

export default class BaseState<E extends Entity = Entity> {
  update(e: E): void { };
  enter(_e: E): void { };
  leave(_e: E): void { };
}
