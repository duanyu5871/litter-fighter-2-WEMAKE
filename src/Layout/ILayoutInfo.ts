import IStyle from "../common/lf2_type/IStyle";

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
  flip_x?: boolean;
  flip_y?: boolean;
  bg_color?: string;
  component?: string | string[];
  style?: IStyle;
  txt?: string;
  actions?: {
    click: string | string[];
    enter?: string | string[];
    leave?: string | string[];
  };
  key_press_actions?: [string, string][];
  tab_type?: string; // 'ud' | 'lr'
  items?: ILayoutInfo[];
}
