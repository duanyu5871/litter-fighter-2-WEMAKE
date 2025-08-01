import { IReq } from './IReq';
import { MsgEnum } from './MsgEnum';
export interface IReqJoinRoom extends IReq<MsgEnum.JoinRoom> {
  roomid?: string;
}
