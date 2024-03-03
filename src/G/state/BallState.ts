/* eslint-disable new-parens */
import BaseState from "./BaseState";
import { Entity } from "../entity/Entity";
import { Defines } from "../../js_utils/lf2_type/defines";

export const BALL_STATES = new Map<number, BaseState>();

class BaseBallState<E extends Entity = Entity> extends BaseState<E> {
  update(e: E): void {
    this.begin(e);
    this.end(e);
  }
  begin(e: E) {
    e.velocity_decay();
    e.handle_frame_velocity();
  }
  end(e: E) {
    e.goto_next_frame_when_need();
  }
}

BALL_STATES.set(Defines.State.Any, new BaseBallState)