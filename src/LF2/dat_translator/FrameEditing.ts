import { IFrameInfo, INextFrame, IHitKeyCollection } from "../defines";
import { IHoldKeyCollection } from "../defines/IHoldKeyCollection";
import { add_next_frame } from "./edit_next_frame";


export class FrameEditing {
  frame: IFrameInfo;
  constructor(frame: IFrameInfo) {
    this.frame = frame;
  }
  init(frame: IFrameInfo) {
    this.frame = frame;
    return this;
  }
  keydown(key: keyof IHoldKeyCollection, ...nexts: INextFrame[]) {
    this.frame.key_down = this.frame.key_down || {};
    this.frame.key_down[key] = add_next_frame(this.frame.key_down[key], ...nexts);
    return this;
  }
  hit(key: keyof IHitKeyCollection, ...nexts: INextFrame[]) {
    this.frame.hit = this.frame.hit || {};
    this.frame.hit[key] = add_next_frame(this.frame.hit[key], ...nexts);
    return this;
  }
}
