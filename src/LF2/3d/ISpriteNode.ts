import type { IObjectNode } from "./IObjectNode";
export interface ISpriteInfo {
  w: number;
  h: number;
  texture?: THREE.Texture;
  color?: string;
}
export interface ISpriteNode extends IObjectNode {
  readonly is_sprite_node: true;
  set_info(info: ISpriteInfo): this;
  get_info(): ISpriteInfo;
}
export const is_sprite_node = (v: any): v is ISpriteNode =>
  v?.is_sprite_node === true;
