import { IFrameInfo } from "../defines";
import { Entity } from "../entity/Entity";
import { StateBase_Proxy } from "./StateBase_Proxy";

export class State_15 extends StateBase_Proxy {
  override enter(e: Entity, prev_frame: IFrameInfo): void {
    e.merge_velocities();
    // e.velocity_0.z = 0;
    return super.enter(e, prev_frame);
  }
}