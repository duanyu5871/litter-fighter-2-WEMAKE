import { ICamera } from "./ICamera";

export interface IPerspectiveCamera extends ICamera {
  readonly is_perspective_camera_node: true;
  get aspect(): number;
  set aspect(v: number);
  setup(
    l: number,
    r: number,
    t: number,
    b: number,
    n?: number,
    f?: number,
  ): this;
}

export const is_perspective_camera_node = (v: any): v is IPerspectiveCamera =>
  v?.is_perspective_camera_node === true;
