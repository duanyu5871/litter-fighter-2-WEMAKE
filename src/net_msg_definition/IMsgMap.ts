import type { IReqCreateRoom, IRespCreateRoom } from "./IMsg_CreateRoom";
import type { IReqJoinRoom, IRespJoinRoom } from "./IMsg_JoinRoom";
import type { IReqPlayerReady, IRespPlayerReady } from "./IMsg_PlayerReady";
import type { IReqRegister, IRespRegister } from "./IMsg_Register";
import type { IReqRoomStart, IRespRoomStart } from "./IMsg_RoomStart";
import type { IReqExitRoom } from "./IReqExitRoom";
import type { IRespListRooms } from "./IMsg_ListRooms";
import type { IRespCloseRoom } from "./IRespCloseRoom";
import type { IRespOtherExitRoom } from "./IRespOtherExitRoom";
import type { IRespOtherJoinRoom } from "./IRespOtherJoinRoom";
import type { MsgEnum } from "./MsgEnum";
export interface IMsgReqMap {
  [MsgEnum.Register]: IReqRegister,
  [MsgEnum.CreateRoom]: IReqCreateRoom,
  [MsgEnum.JoinRoom]: IReqJoinRoom,
  [MsgEnum.PlayerReady]: IReqPlayerReady,
  [MsgEnum.RoomStart]: IReqRoomStart,
  [MsgEnum.ExitRoom]: IReqExitRoom,
  [MsgEnum.OtherExitRoom]: void,
  [MsgEnum.OtherJoinRoom]: void,
  [MsgEnum.CloseRoom]: void,
  [MsgEnum.ListRooms]: void,
}

export interface IMsgRespMap {
  [MsgEnum.Register]: IRespRegister,
  [MsgEnum.CreateRoom]: IRespCreateRoom,
  [MsgEnum.JoinRoom]: IRespJoinRoom,
  [MsgEnum.PlayerReady]: IRespPlayerReady,
  [MsgEnum.RoomStart]: IRespRoomStart,
  [MsgEnum.ExitRoom]: void,
  [MsgEnum.OtherExitRoom]: IRespOtherExitRoom,
  [MsgEnum.OtherJoinRoom]: IRespOtherJoinRoom,
  [MsgEnum.CloseRoom]: IRespCloseRoom,
  [MsgEnum.ListRooms]: IRespListRooms,
}