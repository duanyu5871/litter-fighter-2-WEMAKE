import { MsgEnum } from './MsgEnum';
export interface IResp {
  type: MsgEnum;
  code?: number;
  error?: string;
}
