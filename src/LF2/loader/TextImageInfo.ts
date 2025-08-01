import IStyle from "../defines/IStyle";
import { ImageInfo } from "./ImageInfo";
import { ITextImageInfo } from "./ITextImageInfo";

export class TextImageInfo extends ImageInfo implements ITextImageInfo {
  style: IStyle = {};
  text: string = '';
  override merge(o: ITextImageInfo): this {
    Object.assign(this, o)
    return this;
  }
}
