import type { IObjectNode } from "./IObject";
export interface ISpriteInfo {
  w: number;
  h: number;
  texture?: any;
  color?: string;
}
export interface ISprite extends IObjectNode {
  readonly is_sprite_node: true;
  set_info(info: ISpriteInfo): this;
  get_info(): ISpriteInfo;
}
export const is_sprite_node = (v: any): v is ISprite =>
  v?.is_sprite_node === true;
