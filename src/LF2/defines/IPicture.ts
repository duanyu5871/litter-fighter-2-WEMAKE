export interface IPicture<T> {
  id: string;
  w: number;
  h: number;
  texture: T;
}
export default IPicture