import { MsgEnum } from "./MsgEnum";

export interface IReq<T extends MsgEnum = MsgEnum> {
  pid: string;
  type: T;
}
export interface IResp<T extends MsgEnum = MsgEnum> {
  pid: string;
  type: T;
  code?: number;
  error?: string;
}
