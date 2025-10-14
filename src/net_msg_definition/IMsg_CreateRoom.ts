import type { IReq } from './_IReq';
import type { IResp } from './_IResp';
import type { IRoomInfo } from './IRoomInfo';
import type { MsgEnum } from './MsgEnum';

export interface IReqCreateRoom extends IReq<MsgEnum.CreateRoom> {
  title?: string;
  max_users?: number;
}
export interface IRespCreateRoom extends IResp<MsgEnum.CreateRoom> {
  room?: IRoomInfo;
  error?: string;
}
