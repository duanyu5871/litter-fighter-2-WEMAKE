import * as THREE from "three";
import type { ISprite, ISpriteInfo } from "../../LF2/3d/ISprite";
import Ditto from "../../LF2/ditto";
import { IUINodeRenderer } from "../../LF2/ditto/render/IUINodeRenderer";
import { empty_texture, white_texture } from "../../LF2/loader/ImageMgr";
import type { UINode } from "../../LF2/ui/UINode";

export class UINodeRenderer implements IUINodeRenderer {
  sprite: ISprite;
  node: UINode;
  get world() { return this.node.lf2.world }
  get lf2() { return this.node.lf2 }
  get parent() { return this.node.renderer }
  get visible(): boolean { return this.sprite.visible }
  set visible(v: boolean) { this.sprite.visible = v }
  img_idx = -1
  constructor(node: UINode) {
    this.node = node;
    this.sprite = new Ditto.SpriteNode(node.lf2).add_user_data("owner", node);
  }
  del(child: UINodeRenderer) {
    this.sprite.del(child.sprite)
  }
  add(child: UINodeRenderer) {
    this.sprite.add(child.sprite)
  }
  del_self() {
    this.sprite.del_self();
  }
  on_start() {
    const [x, y, z] = this.node.data.pos;
    const p = this.create_sprite_info();
    this.sprite
      .set_info(p)
      .set_center(...this.node.center)
      .set_position(x, -y, z)
      .set_opacity(p.texture || p.color ? 1 : 0)
      .set_visible(this.node.visible)
      .set_name(`layout(name= ${this.node.name}, id=${this.node.id})`)
      .apply();

    this.node.parent?.renderer.add(this);
  }
  on_stop() {
    this.parent?.del(this)
  }
  create_sprite_info(): ISpriteInfo {
    const [w, h] = this.node.size;
    const texture = this.create_texture();
    const p: ISpriteInfo = {
      w, h, texture, color: this.node.data.color,
    };
    return p;
  }

  update_img() {
    const p = this.create_sprite_info();
    this.sprite.set_info(p).apply();
  }
  protected create_texture(): THREE.Texture | undefined {
    const img_idx = this.node.img_idx;
    const img_info = this.node.img_infos?.[img_idx];
    if (!img_info) {
      return this.node.data.color ? white_texture() : empty_texture();
    }
    const { flip_x, flip_y } = this.node.data;
    const texture = this.lf2.images.create_pic_by_img_info(img_info).texture;
    texture.offset.set(flip_x ? 1 : 0, flip_y ? 1 : 0);
    return texture;
  }
  get x(): number { return this.sprite.x }
  set x(v: number) { this.sprite.x = v; }
  get y(): number { return this.sprite.y }
  set y(v: number) { this.sprite.y = v; }
  render() {
    const [w, h] = this.node.size;
    if (this.sprite.w != w || this.sprite.h != h) {
      this.sprite.set_size(w, h).apply()
    }
    if (this.img_idx != this.node.img_idx) {
      this.img_idx = this.node.img_idx
      this.update_img();
    }
    const s = this.node.scale;
    this.sprite.set_scale(...s);
    const [x, y, z] = this.node.pos
    this.sprite.set_position(x, -y, z);
    this.visible = this.node.visible
    this.sprite.opacity = this.node.opacity;
  }
}
