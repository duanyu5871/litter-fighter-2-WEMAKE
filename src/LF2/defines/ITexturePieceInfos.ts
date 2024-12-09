import { IFramePictureInfo } from "./IFramePictureInfo";
import { ITexturePieceInfo } from "./ITexturePieceInfo";

export interface ITexturePieceInfos extends IFramePictureInfo {
  /** 纹理数据 */
  1: ITexturePieceInfo;
  /** 纹理数据（镜像） */
  [-1]: ITexturePieceInfo;
}
