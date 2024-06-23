import Ball from "../../entity/Ball";
import BaseState from "../base/BaseState";

export default class BaseBallState<E extends Ball = Ball> extends BaseState<E> {
  update(e: E): void {
    e.velocity_decay();
    e.handle_frame_velocity();
    
  }
}
