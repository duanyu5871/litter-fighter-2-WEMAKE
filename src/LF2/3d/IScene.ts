import type { IObjectNode } from "./IObject";

export interface IScene extends IObjectNode {
  readonly is_scene_node: true;
  render(): void;
}
export const is_scene_node = (v: any): v is IScene =>
  v?.is_scene_node === true;
