export interface ILayoutItem {
  key: string;
  img?: string[] | string;
  which?: number | string;
  rect?: number[];
  center?: number[];
  pos?: number[];
  size?: number[];
  visible?: boolean | string;
  flip_x?: boolean;
  flip_y?: boolean;
  bg_color?: string;
  component?: string;
  txt?: string;
  txt_fill?: string;
  txt_stroke?: string;
  font?: string[];
  click_action?: string;
}
