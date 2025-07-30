import { IReq } from './IReq';
import { MsgEnum } from './MsgEnum';

export interface IReqCreateRoom extends IReq {
  type: MsgEnum.CreateRoom;
}
