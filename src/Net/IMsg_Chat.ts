import type { IReq, IResp } from "./_Base";
import type { IPlayerInfo } from "./IPlayerInfo";
import type { MsgEnum } from "./MsgEnum";

export interface IReqChat extends IReq<MsgEnum.Chat> {
  target?: 'global' | 'room';
  text?: string;
}
export interface IRespChat extends IResp<MsgEnum.Chat> {
  /** 发送人 */
  sender?: IPlayerInfo;
  /** 发送时间 */
  date?: number;
  target?: 'global' | 'room';
  text?: string;
}

