import { ICacheData } from "./ICacheData";

export interface ICache {
  get(name: string): Promise<ICacheData | undefined>;
  put(name: string, data: string): Promise<number | void>;
}