import * as THREE from "three";
import { CSS2DObject } from "three/examples/jsm/renderers/CSS2DRenderer";
import type { ISprite, ISpriteInfo } from "../../LF2/3d/ISprite";
import { Ditto } from "../../LF2/ditto";
import type { IUINodeRenderer } from "../../LF2/ditto/render/IUINodeRenderer";
import { IDebugging, make_debugging } from "../../LF2/entity/make_debugging";
import { IImageInfo } from "../../LF2/loader/IImageInfo";
import { empty_texture, white_texture } from "../../LF2/loader/ImageMgr";
import { TextInput } from "../../LF2/ui/component/TextInput";
import type { UINode } from "../../LF2/ui/UINode";
import { is_num, is_str } from "../../LF2/utils";
import { __Sprite } from "../3d";
import styles from "./ui_node_style.module.scss";
import type { WorldRenderer } from "./WorldRenderer";

export class UINodeRenderer implements IUINodeRenderer, IDebugging {
  debug!: (_0: string, ..._1: any[]) => void;
  warn!: (_0: string, ..._1: any[]) => void;
  log!: (_0: string, ..._1: any[]) => void;
  sprite: ISprite;
  node: UINode;

  protected _css_obj: CSS2DObject | undefined;
  protected _dom: HTMLDivElement | undefined;

  protected get dom() {
    if (this._dom) return this._dom;
    this._dom = document.createElement('div');
    this._dom.className = styles.ui_node_style
    this._css_obj = new CSS2DObject(this._dom);
    this._css_obj.position.set(0, 0, 0);
    this._css_obj.center.set(0, 1);

    const txt = this.node.txts.value[this.node.txt_idx.value]
    if (txt?.style.font) this.dom.style.font = txt.style.font;
    if (txt?.style.fill_style) this.dom.style.color = txt.style.fill_style;
    (this.sprite as __Sprite).inner.add(this._css_obj);
    return this._dom;
  }
  protected release_dom() {
    if (!this._css_obj) return;
    (this.sprite as __Sprite).inner.remove(this._css_obj);
    delete this._css_obj;
    delete this._dom;
  }
  protected hide_dom() {
    if (!this._css_obj) return;
    if (!this._css_obj.parent) return;
    (this.sprite as __Sprite).inner.remove(this._css_obj);
  }
  protected show_dom() {
    if (!this._css_obj) return;
    if (this._css_obj.parent) return;
    (this.sprite as __Sprite).inner.add(this._css_obj);
  }

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
    const text_input = this.node.find_component(TextInput)
    if (text_input) {
      const ele_input = document.createElement('input');
      const { maxLength, defaultValue, text } = text_input
      if (is_num(maxLength)) ele_input.maxLength = maxLength
      else ele_input.removeAttribute('maxLength')
      if (is_str(defaultValue)) ele_input.defaultValue = defaultValue
      else ele_input.removeAttribute('defaultValue')
      ele_input.value = text


      ele_input.onchange = () => text_input.text = ele_input.value
      this.dom.appendChild(ele_input)
    }
  };

  on_pause(): void {
    const text_input = this.node.find_component(TextInput)
    if (text_input) this.release_dom()
  };
  on_show(): void { };
  on_hide(): void { };
  on_start() {
    const [x, y, z] = this.node.pos.value;
    this.sprite
      .set_center(...this.node.center.value)
      .set_position(x, -y, z)
      .set_visible(this.node.visible)
      .set_name(`layout(name= ${this.node.name}, id=${this.node.id})`)
      .apply();
    this.node.parent?.renderer.add(this);
  }
  on_stop() {
    this.parent?.del(this);
    this.release_dom();
  }

  update_sprite() {
    if (
      !this.node.img_idx.dirty &&
      !this.node.imgs.dirty &&
      !this.node.txt_idx.dirty &&
      !this.node.txts.dirty &&
      !this.node.size.dirty &&
      !this.node.flip_x.dirty &&
      !this.node.flip_y.dirty &&
      !this.node.color.dirty
    ) return;
    const img =
      this.node.imgs.value[this.node.img_idx.value] ||
      this.node.txts.value[this.node.txt_idx.value];
    this.create_sprite_info(img).then(p => this.sprite.set_info(p).apply());
    if (img) {
      const { w, h, scale } = img
      this.node.size.value = [w / scale, h / scale];
    }
  }

  async create_sprite_info(img: IImageInfo | undefined): Promise<ISpriteInfo> {
    const [w, h] = this.node.size.value;
    const color = this.node.color.value
    const texture = img ? await this.create_texture(img) : color ? white_texture() : empty_texture();
    const p: ISpriteInfo = { w, h, texture, color: color };
    return p;
  }

  protected async create_texture(img: IImageInfo): Promise<THREE.Texture> {
    const flip_x = this.node.flip_x.value;
    const flip_y = this.node.flip_y.value;
    const { texture } = await this.lf2.images.p_create_pic_by_img_info(img);
    texture.offset.set(flip_x ? 1 : 0, flip_y ? 1 : 0);
    return texture;
  }

  get x(): number { return this.sprite.x }
  set x(v: number) { this.sprite.x = v; }
  get y(): number { return this.sprite.y }
  set y(v: number) { this.sprite.y = v; }
  get visible() {
    return this.sprite.visible
  }
  set visible(v: boolean) {
    this.sprite.visible = v
    v ? this.show_dom() : this.hide_dom()
  }
  render() {
    if (this.node.center.dirty || this.node.size.dirty) {
      this.node.center.dirty = this.node.size.dirty = false
      const [w, h] = this.node.size.value;
      const [x, y, z] = this.node.center.value
      this.sprite.set_center(x, y, z).set_size(w, h).apply();
      if (this._dom) {
        this._dom.style.width = `${w}px`
        this._dom.style.height = `${h}px`
      }
      this._css_obj?.center.set(x, y)
    }
    this.update_sprite();
    this.node.scale.dirty && this.sprite.set_scale(...this.node.scale.value);

    // const sp = this.sprite as __Sprite;
    // if (sp) {
    //   const t = sp.inner.material.map;
    //   if (t) {
    //     t.offset.y += 0.001;
    //     t.offset.x += 0.001;
    //     t.wrapS = THREE.RepeatWrapping
    //     t.wrapT = THREE.RepeatWrapping
    //   }
    // }
    if (this.node.pos.dirty) {
      const [x, y, z] = this.node.pos.value
      this.sprite.set_position(x, -y, z);
    }
    this.sprite.visible = this.node.visible
    const opacity = this.node.global_opacity
    this.sprite.opacity = opacity;
    if (this._dom) this._dom.style.opacity = '' + opacity


    this.sprite.apply()
    for (const child of this.node.children)
      if (child.visible !== child.renderer.visible || child.renderer.visible)
        child.renderer.render()
  }
}
