export interface ILayoutInfo {
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
  component?: string;
  txt?: string;
  txt_fill?: string;
  txt_stroke?: string;
  font?: string[];
  z_order?: number;
  actions?: {
    click: string;
    enter?: string;
    leave?: string;
  };
  key_press_actions?: [string, string][];
  tab_type?:string;
  items?: ILayoutInfo[];
}
