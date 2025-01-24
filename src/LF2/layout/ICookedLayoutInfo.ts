import type { TImageInfo } from "../loader/loader";
import type { ILayoutInfo } from "./ILayoutInfo";


export interface ICookedLayoutInfo extends ILayoutInfo {
  pos: [number, number, number];
  center: [number, number, number];
  rect: [number, number, number, number];
  parent?: ICookedLayoutInfo;
  items?: ICookedLayoutInfo[];
  img_infos: TImageInfo[];
  size: [number, number];
  left_top: [number, number];
}
