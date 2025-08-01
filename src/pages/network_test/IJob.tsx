import { IResp } from "../../net_msg_definition";


export interface IJob {
  resolve(r: IResp): void;
  reject(e: any): void;
  timerId?: number;
  ignoreCode?: boolean;
}
