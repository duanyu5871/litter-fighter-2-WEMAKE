import type { IReq, IResp } from "./_Base";
import type { IRoomInfo } from "./IRoomInfo";
import type { MsgEnum } from "./MsgEnum";
export interface IReqCloseRoom extends IReq<MsgEnum.CloseRoom> {

}
export interface IRespCloseRoom extends IResp<MsgEnum.CloseRoom> {
  room?: IRoomInfo
}