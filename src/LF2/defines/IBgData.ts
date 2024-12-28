import { IBgInfo } from "./IBgInfo";
import { IBgLayerInfo } from "./IBgLayerInfo";
import { IBaseData } from "./IBaseData";

export interface IBgData extends IBaseData<IBgInfo> {
  type: "background";
  layers: IBgLayerInfo[];
}
