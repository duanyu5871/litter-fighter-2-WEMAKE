import type { IMsgReqMap, IMsgRespMap } from "./IMsgMap";

export type TReq = IMsgReqMap[keyof IMsgReqMap]
export type TResp = IMsgRespMap[keyof IMsgRespMap]
export * from "./ErrCode";
export * from "./IMsg_CreateRoom";
export * from "./IMsg_JoinRoom";
export * from "./IMsg_ListRooms";
export * from "./IMsg_PlayerReady";
export * from "./IMsg_Register";
export * from "./IMsg_RoomStart";
export * from "./IMsgMap";
export * from "./_IReq";
export * from "./_IResp";
export * from "./IRespCloseRoom";
export * from "./IRespOtherExitRoom";
export * from "./IRespOtherJoinRoom";
export * from "./IRoomInfo";
export * from "./IUserInfo";
export * from "./MsgEnum";
