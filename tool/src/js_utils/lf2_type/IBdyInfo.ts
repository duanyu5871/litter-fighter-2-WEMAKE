import { ITexturePieceInfo } from "./ITexturePieceInfo";

export interface IBdyInfo {
  friendly_fire?: number;
  kind: number;
  x: number;
  y: number;
  w: number;
  h: number;
  indicator_info?: {
    1: ITexturePieceInfo;
    [-1]: ITexturePieceInfo;
  };
}
