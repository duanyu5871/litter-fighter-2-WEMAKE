import type { IComponentInfo } from "./IComponentInfo";
import type { IUIAction } from "./IUIAction";
import type { IUIImgInfo } from "./IUIImgInfo.dat";
import type { IUITxtInfo } from "./IUITxtInfo.dat";
export type TComponentInfo = IComponentInfo | string
export type TAction = IUIAction | string
export type TUITxtInfo = IUITxtInfo | string
export type TUIImgInfo = IUIImgInfo | string
export interface IUIInfo {
  /**
   * 节点ID
   *
   * @type {string}
   * @memberof IUIInfo
   */
  id?: string;

  /**
   * 节点名
   *
   * @type {string}
   * @memberof IUIInfo
   */
  name?: string;

  pos?: number[] | string;
  opacity?: number;
  center?: number[] | string;
  scale?: number[] | string;
  size?: number[] | string;
  visible?: boolean | string;
  disabled?: boolean | string;

  flip_x?: boolean;
  flip_y?: boolean;
  color?: string;
  img?: TUIImgInfo | TUIImgInfo[];
  txt?: TUITxtInfo | TUITxtInfo[];
  which?: number | string;

  component?: TComponentInfo | TComponentInfo[];
  actions?: {
    click: TAction | TAction[];
    resume?: TAction | TAction[];
    pause?: TAction | TAction[];
    start?: TAction | TAction[];
    stop?: TAction | TAction[];
  };
  key_press_actions?: [string, TAction][];
  items?: (IUIInfo | string)[];
  auto_focus?: boolean;
  enabled?: boolean;
  /**
   * 模板名
   *
   * @type {string}
   * @memberof IUIInfo
   */
  template?: string;

  /**
   * 循环创建次数，默认为1
   *
   * @type {number}
   * @memberof IUIInfo
   */
  count?: number;

  values?: { [x in string]?: any };
  templates?: { [x in string]?: IUIInfo };
}
