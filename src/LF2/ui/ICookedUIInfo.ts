import type { IImageInfo } from "../loader/IImageInfo";
import type { IUIInfo } from "./IUIInfo";

export interface ICookedUIInfo extends IUIInfo {
  pos: [number, number, number];
  scale: [number, number, number];
  center: [number, number, number];
  parent?: ICookedUIInfo;
  items?: ICookedUIInfo[];
  img_infos: IImageInfo[];
  size: [number, number];
  templates?: { [x in string]?: ICookedUIInfo };
}