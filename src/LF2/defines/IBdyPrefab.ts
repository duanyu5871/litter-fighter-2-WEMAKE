import type { IBdyInfo } from "./IBdyInfo";

export interface IBdyPrefab extends Partial<IBdyInfo> {
  id: string;
  name?: string;
}
