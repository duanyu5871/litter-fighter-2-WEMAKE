import { IReq } from './IReq';
import { MsgEnum } from './MsgEnum';
export interface IReqJoinRoom extends IReq {
  type: MsgEnum.JoinRoom;
  roomid?: number;
}
