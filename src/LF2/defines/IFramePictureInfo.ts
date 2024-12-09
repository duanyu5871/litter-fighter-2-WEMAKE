import { ITexturePieceInfo } from "./ITexturePieceInfo";

export interface IFramePictureInfo {
  /** 纹理ID */
  tex: number | string;
  /** 裁剪起点X坐标（像素） */
  x: number;
  /** 裁剪起点Y坐标（像素） */
  y: number;
  /** 宽度（像素） */
  w: number;
  /** 高度（像素） */
  h: number;

  /** 纹理数据 */
  1?: ITexturePieceInfo;

  /** 纹理数据（镜像） */
  [-1]?: ITexturePieceInfo;
}
