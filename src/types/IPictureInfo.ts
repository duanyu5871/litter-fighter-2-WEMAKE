export interface IPictureInfo<T> {
  id: string;
  i_w: number;
  i_h: number;
  cell_w: number;
  cell_h: number;
  row: number;
  col: number;
  texture: T;
}
