import type { IReqCloseRoom, IRespCloseRoom } from "./IMsg_CloseRoom";
import type { IReqCreateRoom, IRespCreateRoom } from "./IMsg_CreateRoom";
import type { IReqExitRoom, IReqKick, IRespExitRoom, IRespKick } from "./IMsg_ExitRoom";
import type { IReqJoinRoom, IRespJoinRoom } from "./IMsg_JoinRoom";
import type { IReqListRooms, IRespListRooms } from "./IMsg_ListRooms";
import type { IReqPlayerReady, IRespPlayerReady } from "./IMsg_PlayerReady";
import type { IReqPlayerInfo, IRespPlayerInfo } from "./IMsg_PlayerInfo";
import type { IReqRoomStart, IRespRoomStart } from "./IMsg_RoomStart";
import type { IReqChat, IRespChat } from "./IMsg_Chat";
import type { MsgEnum } from "./MsgEnum";
import { IReq, IResp } from "./_Base";
export interface IMsgReqMap {
  [MsgEnum.PlayerInfo]: IReqPlayerInfo,
  [MsgEnum.CreateRoom]: IReqCreateRoom,
  [MsgEnum.JoinRoom]: IReqJoinRoom,
  [MsgEnum.PlayerReady]: IReqPlayerReady,
  [MsgEnum.RoomStart]: IReqRoomStart,
  [MsgEnum.ExitRoom]: IReqExitRoom,
  [MsgEnum.CloseRoom]: IReqCloseRoom,
  [MsgEnum.ListRooms]: IReqListRooms,
  [MsgEnum.Error]: IReq<MsgEnum.Error>,
  [MsgEnum.Kick]: IReqKick,
  [MsgEnum.Chat]: IReqChat
}
export interface IMsgRespMap {
  [MsgEnum.PlayerInfo]: IRespPlayerInfo,
  [MsgEnum.CreateRoom]: IRespCreateRoom,
  [MsgEnum.JoinRoom]: IRespJoinRoom,
  [MsgEnum.PlayerReady]: IRespPlayerReady,
  [MsgEnum.RoomStart]: IRespRoomStart,
  [MsgEnum.ExitRoom]: IRespExitRoom,
  [MsgEnum.JoinRoom]: IRespJoinRoom,
  [MsgEnum.CloseRoom]: IRespCloseRoom,
  [MsgEnum.ListRooms]: IRespListRooms,
  [MsgEnum.Error]: IResp<MsgEnum.Error>,
  [MsgEnum.Kick]: IRespKick,
  [MsgEnum.Chat]: IRespChat,
}