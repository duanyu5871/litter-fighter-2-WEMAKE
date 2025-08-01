import { IReq } from "./IReq";
import { IRoomInfo } from "./IRoomInfo";
import { MsgEnum } from "./MsgEnum";

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