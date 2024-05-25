import type IZipObject from "./IZipObject";

export default interface IZip {
  file(path: string): IZipObject | null
  file(path: RegExp): IZipObject[]
  file(path: string | RegExp): IZipObject | null | IZipObject[];
}