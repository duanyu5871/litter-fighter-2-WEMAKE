import { IFrameInfo } from "./IFrameInfo";


export interface ICharacterFrameInfo extends IFrameInfo {
  jump_flag?: number;
  dash_flag?: number;
}
