export interface IVector2 {
  x: number;
  y: number;
  set(x: number, y: number): void;
  add(o: IVector2): IVector2;
  sub(o: IVector2): IVector2;
  length(): number;
  clone(): IVector2;
  normalize(): this;
}
