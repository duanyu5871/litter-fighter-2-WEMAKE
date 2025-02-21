import { ImageInfo } from "./ImageInfo";
import { ITextImageInfo } from "./ITextImageInfo";

export class TextImageInfo extends ImageInfo implements ITextImageInfo {
  text: string = '';
  override merge(o: ITextImageInfo): this {
    Object.assign(this, o)
    return this;
  }
}
