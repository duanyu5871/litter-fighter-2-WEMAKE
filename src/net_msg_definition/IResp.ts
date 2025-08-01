import { MsgEnum } from './MsgEnum';
export interface IResp<T extends MsgEnum = MsgEnum> {
  pid: string;
  type: T;
  code?: number;
  error?: string;
}
