export interface IVector3 {
  x: number;
  y: number;
  z: number;
  set(x: number, y: number, z: number): void;
  add(o: IVector3): void;
}