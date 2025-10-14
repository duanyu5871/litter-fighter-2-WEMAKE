import type { IReq, IResp } from './_Base';
import type { IRoomInfo } from './IRoomInfo';
import type { IUserInfo } from './IUserInfo';
import type { MsgEnum } from './MsgEnum';

export interface IReqJoinRoom extends IReq<MsgEnum.JoinRoom> {
  roomid?: string;
}
export interface IRespJoinRoom extends IResp<MsgEnum.JoinRoom> {
  room: IRoomInfo;
  player?: IUserInfo;
}
