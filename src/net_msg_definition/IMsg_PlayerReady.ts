import type { IReq } from './_IReq';
import type { IResp } from './_IResp';
import type { MsgEnum } from './MsgEnum';

export interface IReqPlayerReady extends IReq<MsgEnum.PlayerReady> {
  ready: boolean
}

export interface IRespPlayerReady extends IResp<MsgEnum.PlayerReady> {
  ready: boolean
}

