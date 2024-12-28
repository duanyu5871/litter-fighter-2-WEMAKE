export interface IVector2 {
  x: number;
  y: number;
  set(x: number, y: number): void;
  add(o: IVector2): void;
}
