import type { IImageInfo } from "../loader/IImageInfo";
import { ITextImageInfo } from "../loader/ITextImageInfo";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import type { IUIInfo } from "./IUIInfo.dat";
import { ICookedUITxtInfo } from "./IUITxtInfo.dat";

export interface ICookedUIInfo extends IUIInfo {
  id: string;
  name: string;
  pos: [number, number, number];
  scale: [number, number, number];
  center: [number, number, number];
  parent?: ICookedUIInfo;
  items?: ICookedUIInfo[];
  img_infos: IImageInfo[];
  txt_infos: ITextImageInfo[];
  size: [number, number];
  enabled: boolean;
  img: IUIImgInfo[];
  txt: ICookedUITxtInfo[];
  values: { [x in string]?: any };
}