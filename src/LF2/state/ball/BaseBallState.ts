import Entity from "../../entity/Entity";
import BaseState from "../base/BaseState";

export class BaseBallState<E extends Entity = Entity> extends BaseState<E> {
  update(e: E): void {
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}
