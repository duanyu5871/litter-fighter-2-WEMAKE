import { IResp } from "../../Net";


export interface IJob {
  resolve(r: IResp): void;
  reject(e: any): void;
  timerId?: number;
  ignoreCode?: boolean;
}
