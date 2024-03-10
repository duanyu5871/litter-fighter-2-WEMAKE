import { IBdyInfo } from "./IBdyInfo";
import { IBpointInfo } from "./IBpointInfo";
import { ICpointInfo } from "./ICpointInfo";
import { IFramePictureInfo } from "./IFramePictureInfo";
import { IItrInfo } from "./IItrInfo";
import { IOpointInfo } from "./IOpointInfo";
import { ITexturePieceInfos } from "./ITexturePieceInfos";
import { IWpointInfo } from "./IWpointInfo";
import { TNextFrame, IHoldKeyCollection, IHitKeyCollection } from ".";
import { IRectPair } from "./IRectPair";

export interface IFrameInfo {
  id: string;
  name: string;
  pic: number | IFramePictureInfo | ITexturePieceInfos;
  state: number;
  wait: number;
  next: TNextFrame;
  dvx?: number;
  dvy?: number;
  dvz?: number;
  centerx: number;
  centery: number;
  sound?: string;
  mp?: number;
  hp?: number;
  hold?: IHoldKeyCollection;
  hit?: IHitKeyCollection;
  bdy?: IBdyInfo[];
  itr?: IItrInfo[];
  wpoint?: IWpointInfo;
  bpoint?: IBpointInfo;
  opoint?: IOpointInfo[];
  cpoint?: ICpointInfo;
  indicator_info?: IRectPair;
}
