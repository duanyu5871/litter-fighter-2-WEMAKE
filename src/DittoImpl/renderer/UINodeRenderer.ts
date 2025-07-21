import * as THREE from "three";
import type { ISprite, ISpriteInfo } from "../../LF2/3d/ISprite";
import Ditto from "../../LF2/ditto";
import type { UINode } from "../../LF2/layout/UINode";
import { empty_texture, white_texture } from "../../LF2/loader/loader";
import { IUINodeRenderer } from "../../LF2/ditto/render/IUINodeRenderer";

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
      w,
      h,
      texture,
      color: this.node.data.bg_color,
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
    if (!img_info)
      return this.node.data.bg_color ? white_texture() : empty_texture();
    const { flip_x, flip_y } = this.node.data;
    const texture = this.lf2.images.create_pic_by_img_info(img_info).texture;
    texture.offset.set(flip_x ? 1 : 0, flip_y ? 1 : 0);
    return texture;
  }

  render() {
    if (this.img_idx != this.node.img_idx) {
      this.img_idx = this.node.img_idx
      this.update_img();
    }
    const [x, y, z] = this.node.pos
    this.sprite.set_position(x, -y, z);
    if (this.node.root === this.node) this.sprite.x = this.world.renderer.cam_x;
    this.visible = this.node.visible
    this.sprite.opacity = this.node.opacity;
  }
}
