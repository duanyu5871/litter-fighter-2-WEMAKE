export interface IVec3 {
  x: number;
  y: number;
  z: number;
  set(x: number, y: number, z: number): void;
  add(o: IVec3): void;
}