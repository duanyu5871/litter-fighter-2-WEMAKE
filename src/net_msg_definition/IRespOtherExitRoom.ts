import type { IResp } from "./_IResp";
import type { IUserInfo } from "./IUserInfo";
import type { MsgEnum } from "./MsgEnum";

export interface IRespOtherExitRoom extends IResp<MsgEnum.OtherExitRoom> {
  player?: IUserInfo
}
