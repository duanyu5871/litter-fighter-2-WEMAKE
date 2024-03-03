import { Entity } from "../Entity";

export default abstract class BaseState<E extends Entity = Entity> {
  abstract update(e: E): void;
  enter(_e: E): void { };
  leave(_e: E): void { };
}
