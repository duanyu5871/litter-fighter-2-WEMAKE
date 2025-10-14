import type { IReq, IResp } from './_Base';
import type { IUserInfo } from './IUserInfo';
import type { MsgEnum } from './MsgEnum';

export interface IReqRegister extends IReq<MsgEnum.Register> {
  name?: string
}
export interface IRespRegister extends IResp<MsgEnum.Register> {
  user: IUserInfo;
}
