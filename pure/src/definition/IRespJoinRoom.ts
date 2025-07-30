import type { IResp } from './IResp';
import type { IRoomInfo } from './IRoomInfo';
import type { MsgEnum } from './MsgEnum';

export interface IRespJoinRoom extends IResp {
  type: MsgEnum.JoinRoom;
  room: IRoomInfo;
}
