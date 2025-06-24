import type { IBgInfo } from "./IBgInfo";
import type { IBgLayerInfo } from "./IBgLayerInfo";
import type { IBaseData } from "./IBaseData";

export interface IBgData extends IBaseData<IBgInfo> {
  type: "background";
  layers: IBgLayerInfo[];
}
