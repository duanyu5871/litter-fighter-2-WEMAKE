import { IResp } from './IResp';
import { IRoomInfo } from './IRoomInfo';
import { MsgEnum } from './MsgEnum';

export interface IRespCreateRoom extends IResp<MsgEnum.CreateRoom> {
  room?: IRoomInfo;
  error?: string;
}
