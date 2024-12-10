import { ICacheData } from "./ICacheData";

export interface ICache {
  get(name: string): Promise<ICacheData | undefined>;
  put(name: string, data: string): Promise<number | void>;
  del(...name: string[]): Promise<number | void>;
  list(): Promise<ICacheData[] | undefined>;
}