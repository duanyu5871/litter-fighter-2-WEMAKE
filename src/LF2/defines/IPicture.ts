export interface IPicture<T> {
  id: string;
  w: number;
  h: number;
  cell_w: number;
  cell_h: number;
  row: number;
  col: number;
  texture: T;
}
export default IPicture