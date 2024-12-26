import { IItrInfo } from "./IItrInfo";

export interface IItrPrefab extends Partial<IItrInfo> {
  id: string;
  name?: string;
}
