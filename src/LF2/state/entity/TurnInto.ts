import type { IFrameInfo } from "../../defines";
import { Defines } from "../../defines/defines";
import type Entity from "../../entity/Entity";
import BaseState from "../base/BaseState";

export default class TurnInto extends BaseState<Entity> {
  enter(e: Entity, prev_frame: IFrameInfo): void {
    e.enter_frame({ id: Defines.FrameId.Gone })
  }
}
