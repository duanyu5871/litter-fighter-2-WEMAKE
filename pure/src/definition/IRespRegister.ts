import type { IUserInfo } from './IUserInfo';
import type { MsgEnum } from './MsgEnum';

export interface IRespRegister {
  type: MsgEnum.Register;
  user: IUserInfo;
}
