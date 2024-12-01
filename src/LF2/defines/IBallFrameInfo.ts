import { IFrameInfo } from "./IFrameInfo";
import { TNextFrame } from ".";


export interface IBallFrameInfo extends IFrameInfo {
  on_disappearing?: TNextFrame;
  on_rebounding?: TNextFrame;
  on_be_hit?: TNextFrame;
  on_hitting?: TNextFrame;
  on_timeout?: TNextFrame;
  speedz?: number;
  behavior?: number;
}
