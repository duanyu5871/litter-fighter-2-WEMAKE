import { IBaseData } from "./IBaseData";
import { IBdyPrefab } from "./IBdyPrefab";
import { IItrPrefab } from "./IItrPrefab";
import { IEntityInfo } from "./IEntityInfo";
import { IFrameIndexes } from "./IFrameIndexes";
import { IFrameInfo } from "./IFrameInfo";
import { TNextFrame } from "./INextFrame";

export interface IEntityData extends IBaseData<IEntityInfo> {
  type: "entity" | "character" | "weapon" | "ball";
  on_dead?: TNextFrame;
  on_exhaustion?: TNextFrame;
  indexes?: IFrameIndexes;
  bdy_prefabs?: {
    [x in string]?: IBdyPrefab;
  };
  itr_prefabs?: {
    [x in string]?: IItrPrefab;
  };
  frames: Record<string, IFrameInfo>;
}
