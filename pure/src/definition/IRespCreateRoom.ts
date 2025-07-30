import { IResp } from './IResp';
import { IRoomInfo } from './IRoomInfo';
import { MsgEnum } from './MsgEnum';

export interface IRespCreateRoom extends IResp {
  type: MsgEnum.CreateRoom;
  room?: IRoomInfo;
  error?: string;
}
