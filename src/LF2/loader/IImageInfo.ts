import { MagnificationTextureFilter } from "../defines/MagnificationTextureFilter";
import { MinificationTextureFilter } from "../defines/MinificationTextureFilter";
import { TextureWrapping } from "../defines/TextureWrapping";

export interface IImageInfo {
  key: string;
  url: string;
  src_url: string;
  scale: number;
  /** 图片宽度（像素） */
  w: number;
  /** 图片高度（像素） */
  h: number;
  min_filter?: MinificationTextureFilter;
  mag_filter?: MagnificationTextureFilter;
  wrap_s?: TextureWrapping;
  wrap_t?: TextureWrapping;
}
