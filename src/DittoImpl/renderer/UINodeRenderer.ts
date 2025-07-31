import * as THREE from "three";
import type { ISprite, ISpriteInfo } from "../../LF2/3d/ISprite";
import Ditto from "../../LF2/ditto";
import type { IUINodeRenderer } from "../../LF2/ditto/render/IUINodeRenderer";
import { IDebugging, make_debugging } from "../../LF2/entity/make_debugging";
import { empty_texture, white_texture } from "../../LF2/loader/ImageMgr";
import type { UINode } from "../../LF2/ui/UINode";
import type { WorldRenderer } from "./WorldRenderer";

export class UINodeRenderer implements IUINodeRenderer, IDebugging {
  debug!: (_0: string, ..._1: any[]) => void;
  warn!: (_0: string, ..._1: any[]) => void;
  log!: (_0: string, ..._1: any[]) => void;
  sprite: ISprite;
  node: UINode;
  get world() { return this.node.lf2.world }
  get lf2() { return this.node.lf2 }
  get parent() { return this.node.renderer }
  img_idx = -1
  constructor(node: UINode) {
    this.node = node;
    this.sprite = new Ditto.SpriteNode(node.lf2).add_user_data("owner", node);
    make_debugging(this)
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
  on_resume(): void {
    const world_renderer = this.lf2.world.renderer as WorldRenderer;
    if (this.node.root === this.node) world_renderer.scene.add(this.sprite);
  };
  on_pause(): void { };
  on_show(): void { };
  on_hide(): void { };
  on_start() {
    const [x, y, z] = this.node.data.pos;
    this.sprite
      .set_center(...this.node.center)
      .set_position(x, -y, z)
      .set_visible(this.node.visible)
      .set_name(`layout(name= ${this.node.name}, id=${this.node.id})`)
      .apply();

    this.create_sprite_info().then((p) => {
      this.sprite.set_info(p).set_opacity(p.texture || p.color ? 1 : 0)
    });
    this.node.parent?.renderer.add(this);
  }
  on_stop() {
    this.parent?.del(this)
  }
  async create_sprite_info(): Promise<ISpriteInfo> {
    const [w, h] = this.node.size;
    const texture = await this.create_texture();
    const p: ISpriteInfo = {
      w, h, texture, color: this.node.data.color,
    };
    return p;
  }

  update_img() {
    this.create_sprite_info().then(p => this.sprite.set_info(p).apply());
  }
  protected async create_texture(): Promise<THREE.Texture> {
    const img_idx = this.node.img_idx;
    const img_info = this.node.imgs[img_idx];
    if (!img_info) {
      return this.node.data.color ? white_texture() : empty_texture();
    }
    const { flip_x, flip_y } = this.node.data;
    const { texture } = await this.lf2.images.p_create_pic_by_img_info(img_info);
    texture.offset.set(flip_x ? 1 : 0, flip_y ? 1 : 0);
    return texture;
  }
  get x(): number { return this.sprite.x }
  set x(v: number) { this.sprite.x = v; }
  get y(): number { return this.sprite.y }
  set y(v: number) { this.sprite.y = v; }
  get visible() { return this.sprite.visible }
  set visible(v: boolean) { this.sprite.visible = v }
  render() {
    const [w, h] = this.node.size;
    if (this.sprite.w != w || this.sprite.h != h) {
      this.sprite.set_size(w, h).apply()
    }
    if (this.img_idx != this.node.img_idx) {
      this.img_idx = this.node.img_idx
      this.update_img();
    }
    this.sprite.set_scale(...this.node.scale);
    const [x, y, z] = this.node.pos
    this.sprite.set_position(x, -y, z);
    this.sprite.visible = this.node.visible
    this.sprite.opacity = this.node.opacity;
    this.sprite.apply()
    for (const child of this.node.children)
      if (child.visible !== child.renderer.visible || child.renderer.visible)
        child.renderer.render()
  }
}
