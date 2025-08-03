import IStyle from "../defines/IStyle";


export interface IUITxtInfo {
  value: string;
  style?: IStyle;
  "value#zh-hans"?: string,
  "value#zh-cn"?: string,
  "value#zh-sg"?: string,
  "value#zh-my"?: string,
  "value#zh-hant"?: string,
  "value#zh-tw"?: string,
  "value#zh-hk"?: string,
  "value#zh-mo"?: string,
  // TODO: add more langs?
}
