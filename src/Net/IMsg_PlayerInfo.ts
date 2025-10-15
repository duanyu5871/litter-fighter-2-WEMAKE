import type { IReq, IResp } from './_Base';
import type { IPlayerInfo } from './IPlayerInfo';
import type { MsgEnum } from './MsgEnum';

export interface IReqPlayerInfo extends IReq<MsgEnum.PlayerInfo> {
  name?: string
}
export interface IRespPlayerInfo extends IResp<MsgEnum.PlayerInfo> {
  player?: IPlayerInfo;
}
