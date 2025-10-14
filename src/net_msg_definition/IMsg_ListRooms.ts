import type { IReq } from "./_IReq";
import type { IRoomInfo } from "./IRoomInfo";
import type { MsgEnum } from "./MsgEnum";

export interface IReqListRooms extends IReq<MsgEnum.ListRooms> {
  offset?: number;
  limit?: number;
}

export interface IRespListRooms extends IReq<MsgEnum.ListRooms> {
  offset?: number;
  limit?: number;
  rooms?: IRoomInfo[];
  total?: number;
}