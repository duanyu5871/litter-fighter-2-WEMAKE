import type { IFrameInfo } from "../../defines";
import type Entity from "../../entity/Entity";

export class BaseState<E extends Entity = Entity, F extends IFrameInfo = IFrameInfo> {
  state: number = -1;
  update(e: E): void { };
  enter(e: E, prev_frame: F): void { };
  leave(e: E, next_frame: F): void { };
  on_landing(e: E, vx: number, vy: number, vz: number): void { };
  get_gravity(e: E): number { return e.world.gravity }
}
export default BaseState;