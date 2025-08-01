import { MsgEnum } from "./MsgEnum";

export interface IReq<T extends MsgEnum = MsgEnum> {
  pid: string;
  type: T;
}