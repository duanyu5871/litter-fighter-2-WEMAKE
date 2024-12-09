import { TNextFrame } from ".";
import { IBdyInfo } from "./IBdyInfo";
import { IBpointInfo } from "./IBpointInfo";
import { ICpointInfo } from "./ICpointInfo";
import { IFramePictureInfo } from "./IFramePictureInfo";
import { IHitKeyCollection } from "./IHitKeyCollection";
import { IHoldKeyCollection } from "./IHoldKeyCollection";
import { IItrInfo } from "./IItrInfo";
import { IOpointInfo } from "./IOpointInfo";
import { IRectPair } from "./IRectPair";
import { IWpointInfo } from "./IWpointInfo";

export interface IFrameInfo {
  id: string;
  name: string;
  pic?: IFramePictureInfo;
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
  invisible?: number;
  no_shadow?: number;
}
