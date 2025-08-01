import { IResp } from './IResp';
import type { IUserInfo } from './IUserInfo';
import type { MsgEnum } from './MsgEnum';

export interface IRespRegister extends IResp<MsgEnum.Register>{
  user: IUserInfo;
}
