/* eslint-disable new-parens */
import { Defines } from "../../js_utils/lf2_type/defines";
import { Entity } from "../entity/Entity";
import BaseState from "./BaseState";

export const BALL_STATES = new Map<number, BaseState>();

class BaseBallState<E extends Entity = Entity> extends BaseState<E> {
  update(e: E): void {
    e.velocity_decay();
    e.handle_frame_velocity();
  }
}

BALL_STATES.set(Defines.State.Any, new BaseBallState)