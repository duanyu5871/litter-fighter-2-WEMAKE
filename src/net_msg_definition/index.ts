import type { IReqCreateRoom } from "./IReqCreateRoom";
import type { IReqJoinRoom } from "./IReqJoinRoom";
import type { IReqPlayerNotReady } from "./IReqPlayerNotReady";
import type { IReqPlayerReady } from "./IReqPlayerReady";
import type { IReqRegister } from "./IReqRegister";
import { IReqRoomStart } from "./IReqRoomStart";

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
export * from "./IRespRegister";
export * from "./IRoomInfo";
export * from "./IUserInfo";
export * from "./MsgEnum";

export type TReq = IReqJoinRoom | IReqCreateRoom | IReqRegister | IReqPlayerReady | IReqPlayerNotReady | IReqRoomStart;