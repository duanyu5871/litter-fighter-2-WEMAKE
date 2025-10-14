import type { IReq } from "./_IReq";
import type { MsgEnum } from "./MsgEnum";
import type { IResp } from "./_IResp";

export interface IReqRoomStart extends IReq<MsgEnum.RoomStart> { }
export interface IRespRoomStart extends IResp<MsgEnum.RoomStart> { }

