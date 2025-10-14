import type { IReq } from './_IReq';
import type { IResp } from './_IResp';
import type { IRoomInfo } from './IRoomInfo';
import type { MsgEnum } from './MsgEnum';

export interface IReqJoinRoom extends IReq<MsgEnum.JoinRoom> {
  roomid?: string;
}
export interface IRespJoinRoom extends IResp<MsgEnum.JoinRoom> {
  room: IRoomInfo;
}
