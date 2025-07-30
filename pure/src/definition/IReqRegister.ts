import { MsgEnum as MsgEnum } from './MsgEnum';

export interface IReqRegister {
  type: MsgEnum.Register;
  name?: string
}
