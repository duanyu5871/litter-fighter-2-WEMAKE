import type { IResp } from "./_IResp";
import type { IUserInfo } from "./IUserInfo";
import type { MsgEnum } from "./MsgEnum";

export interface IRespOtherJoinRoom extends IResp<MsgEnum.OtherJoinRoom> {
  player?: IUserInfo
}
