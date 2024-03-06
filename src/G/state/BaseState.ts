import { IFrameInfo } from "../../js_utils/lf2_type";
import { Entity } from "../entity/Entity";

export default class BaseState<E extends Entity = Entity, F extends IFrameInfo = IFrameInfo> {
  update(e: E): void { };
  enter(e: E, prev_frame: F): void { };
  leave(e: E, next_frame: F): void { };
}
