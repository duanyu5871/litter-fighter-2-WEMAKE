import type { IReq, IResp } from './_Base';
import type { IUserInfo } from "./IUserInfo";
import type { MsgEnum } from "./MsgEnum";

export interface IReqExitRoom extends IReq<MsgEnum.ExitRoom> {

}
export interface IRespExitRoom extends IResp<MsgEnum.ExitRoom> {
  player?: IUserInfo
}
