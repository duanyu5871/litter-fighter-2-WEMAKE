import IStyle from "../defines/IStyle";
import { IImageInfo } from "./IImageInfo";

export interface ITextImageInfo extends IImageInfo {
  text: string;
  style: IStyle
}
