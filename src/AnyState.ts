import BaseState from "./BaseState";
import Entity from "./G/Entity";

export class AnyState<E extends Entity = Entity> extends BaseState<E> {
  update(e: E): void {
    this.begin(e);
    this.end(e);
  }
  begin(e: E) {
    e.on_gravity();
    e.velocity_decay();
    e.handle_frame_velocity();
  }
  end(e: E) {
    e.goto_next_frame_when_need();
  }
}
