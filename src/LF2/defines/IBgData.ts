import { IBgInfo } from "./IBgInfo";
import { IBgLayerInfo } from "./IBgLayerInfo";
import { IBaseData } from ".";


export interface IBgData extends IBaseData<IBgInfo> {
  get is_bg_data(): true;
  type: 'background';
  layers: IBgLayerInfo[];
}
