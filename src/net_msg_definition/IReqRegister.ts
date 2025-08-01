import type { IReq } from './IReq';
import type { MsgEnum } from './MsgEnum';

export interface IReqRegister extends IReq<MsgEnum.Register> {
  name?: string
}
