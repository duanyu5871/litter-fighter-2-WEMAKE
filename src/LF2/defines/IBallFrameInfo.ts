import { IFrameInfo } from "./IFrameInfo";
import { TNextFrame } from ".";


export interface IBallFrameInfo extends IFrameInfo {
  on_disappearing?: TNextFrame;
  on_rebounding?: TNextFrame;
  // on_hitting?: TNextFrame;
  behavior?: number;
}
