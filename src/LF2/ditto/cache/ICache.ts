import { ICacheData } from "./ICacheData";

export interface ICache {
  get(name: string): Promise<ICacheData | undefined>;
  put(name: string, version: number, url: string, data: string): Promise<number | void>;
  del(...name: string[]): Promise<number | void>;
  list(): Promise<ICacheData[] | undefined>;
}