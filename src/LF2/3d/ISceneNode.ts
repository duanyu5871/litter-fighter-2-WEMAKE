import { IObjectNode } from "./IObjectNode";

export interface ISceneNode extends IObjectNode {
  readonly is_scene_node: true;
  render(): void;
}
export const is_scene_node = (v: any): v is ISceneNode =>
  v?.is_scene_node === true;
