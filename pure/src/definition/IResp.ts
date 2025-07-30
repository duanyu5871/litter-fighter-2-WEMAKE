import { MsgEnum as MsgEnum } from './MsgEnum';

export interface IResp {
  type: MsgEnum;
  error?: string;
}
