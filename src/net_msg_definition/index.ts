import type { IReqCreateRoom } from "./IReqCreateRoom";
import type { IReqExitRoom } from "./IReqExitRoom";
import type { IReqJoinRoom } from "./IReqJoinRoom";
import type { IReqPlayerNotReady } from "./IReqPlayerNotReady";
import type { IReqPlayerReady } from "./IReqPlayerReady";
import type { IReqRegister } from "./IReqRegister";
import type { IReqRoomStart } from "./IReqRoomStart";
import { IRespOtherExitRoom } from "./IRespOtherExitRoom";
import { IRespOtherJoinRoom } from "./IRespOtherJoinRoom";

export * from "./ErrCode";
export * from "./IReq";
export * from "./IReqCreateRoom";
export * from "./IReqJoinRoom";
export * from "./IReqPlayerNotReady";
export * from "./IReqPlayerReady";
export * from "./IReqRegister";
export * from "./IReqRoomStart";
export * from "./IResp";
export * from "./IRespCreateRoom";
export * from "./IRespJoinRoom";
export * from "./IRespOtherExitRoom";
export * from "./IRespOtherJoinRoom";
export * from "./IRespRegister";
export * from "./IRoomInfo";
export * from "./IUserInfo";
export * from "./IRespCloseRoom"
export * from "./MsgEnum";
export type TReq = IReqJoinRoom | IReqCreateRoom | IReqRegister |
  IReqPlayerReady | IReqPlayerNotReady | IReqRoomStart | IReqExitRoom |
  IRespOtherExitRoom | IRespOtherJoinRoom;