/* auto re-export */
import { type IZipObject } from "./IZipObject";
export interface IZip {
  readonly buf: Uint8Array;
  file(path: string): IZipObject | null;
  file(path: RegExp): IZipObject[];
  file(path: string | RegExp): IZipObject | null | IZipObject[];
}
