import IStyle from "../defines/IStyle";

export interface ILayoutInfo {
  values?: { [x in string]?: any },
  id?: string;
  name?: string;
  img?: string[] | string;
  opacity?: number;
  which?: number | string;
  rect?: number[] | string;
  center?: number[] | string;
  pos?: number[] | string;
  size?: number[] | string;
  visible?: boolean | string;
  disabled?: boolean | string;
  flip_x?: boolean;
  flip_y?: boolean;
  bg_color?: string;
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
  items?: (ILayoutInfo | string)[];

  auto_focus?: boolean;
  template?: string;
}
