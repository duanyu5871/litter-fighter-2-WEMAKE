import { IResp } from "../../Net";
import { ISendOpts } from "./Connection";


export interface IJob extends ISendOpts {
  resolve(r: IResp): void;
  reject(e: any): void;
  timerId?: number;
}
