import { IFrameInfo } from "../../defines";
import FrameAnimater from "../../entity/FrameAnimater";

export default class BaseState<E extends FrameAnimater = FrameAnimater, F extends IFrameInfo = IFrameInfo> {
  state: number = -1;
  update(e: E): void { };
  enter(e: E, prev_frame: F): void { };
  leave(e: E, next_frame: F): void { };
  on_landing(e: E, vx: number, vy: number, vz: number): void { };
}
