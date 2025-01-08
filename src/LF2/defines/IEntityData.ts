import { IBaseData } from "./IBaseData";
import { IBdyPrefab } from "./IBdyPrefab";
import { IItrPrefab } from "./IItrPrefab";
import { IEntityInfo } from "./IEntityInfo";
import { IFrameIndexes } from "./IFrameIndexes";
import { IFrameInfo } from "./IFrameInfo";
import { TNextFrame } from "./INextFrame";
export type TItrPrefabs = {
  [x in string]?: IItrPrefab;
}
export type TBdyPrefabs = {
  [x in string]?: IBdyPrefab;
}
export interface IEntityData extends IBaseData<IEntityInfo> {
  type: "entity" | "character" | "weapon" | "ball";
  on_dead?: TNextFrame;
  on_exhaustion?: TNextFrame;
  indexes?: IFrameIndexes;
  bdy_prefabs?: TBdyPrefabs;
  itr_prefabs?: TItrPrefabs;
  frames: Record<string, IFrameInfo>;
}
