import IStyle from "../defines/IStyle";

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
  img?: string[] | string;
  opacity?: number;
  which?: number | string;
  rect?: number[] | string;
  center?: number[] | string;
  scale?: number[] | string;
  pos?: number[] | string;
  size?: number[] | string;
  visible?: boolean | string;
  disabled?: boolean | string;
  flip_x?: boolean;
  flip_y?: boolean;
  color?: string;
  component?: string | string[];
  style?: IStyle;
  txt?: string;
  actions?: {
    click: string | string[];
    resume?: string | string[];
    pause?: string | string[];
    start?: string | string[];
    stop?: string | string[];
  };
  key_press_actions?: [string, string][];
  items?: (IUIInfo | string)[];
  auto_focus?: boolean;
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
