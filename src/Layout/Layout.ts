import * as THREE from 'three';
import LF2 from '../LF2/LF2';
import Callbacks from '../LF2/base/Callbacks';
import Expression, { ValGetter } from '../LF2/base/Expression';
import { TKeyName } from '../LF2/controller/BaseController';
import IStyle from '../LF2/loader/IStyle';
import { type TImageInfo } from '../LF2/loader/loader';
import NumberAnimation from '../common/animation/NumberAnimation';
import { is_arr } from '../common/is_arr';
import { is_bool } from '../common/is_bool';
import { is_num } from '../common/is_num';
import { is_str } from '../common/is_str';
import actor from './Action/Actor';
import factory from './Component/Factory';
import { LayoutComponent } from './Component/LayoutComponent';
import LayoutMeshBuilder from './Component/LayoutMeshBuilder';
import type { ILayoutInfo } from './ILayoutInfo';
import read_nums from './utils/read_nums';

export interface ILayoutCallback {
  on_click?(): void;
  on_show?(layout: Layout): void;
  on_hide?(layout: Layout): void;
}

export default class Layout {
  protected _callbacks = new Callbacks<ILayoutCallback>();
  protected _opacity_animation = new NumberAnimation();

  /**
   * 根节点
   *
   * @protected
   * @type {Layout}
   */
  protected _root: Layout;
  protected _left_to_right: Layout[] = [];
  protected _top_to_bottom: Layout[] = [];
  protected _focused_item?: Layout;
  protected _components = new Set<LayoutComponent>();

  protected _id_layout_map?: Map<string, Layout>;
  protected _name_layout_map?: Map<string, Layout>;

  set_opacity_animation(
    reverse: boolean,
    begin: number = 0,
    end: number = 1,
    duration: number = 150
  ) {
    const anim = this._opacity_animation;
    if (begin !== anim.val_1 && end !== anim.val_2 && duration !== anim.duration)
      anim.set(begin, end, duration, reverse).set_value(this.material?.opacity || 0)
    if (anim.reverse !== reverse)
      anim.play(reverse).set_value(this.material?.opacity || 0);
  }
  protected _state: any = {}
  protected _visible = () => true;
  protected _img_idx = () => 0;
  protected _opacity = () => 1;
  protected _parent?: Layout;
  protected _children: Layout[] = [];
  protected _index: number = 0;
  protected _level: number = 0;
  protected readonly data: Readonly<ILayoutInfo>;

  center: [number, number];
  pos: [number, number, number] = [0, 0, 0];
  img_infos?: TImageInfo[];
  src_rect: [number, number, number, number] = [0, 0, 0, 0];
  dst_rect: [number, number, number, number] = [0, 0, 0, 0];
  lf2: LF2;

  get focused_item(): Layout | undefined { return this._root === this ? this._focused_item : this._root._focused_item }
  get id(): string | undefined { return this.data.id }
  get name(): string | undefined { return this.data.name }
  get x(): number { return this.pos[0] };
  get y(): number { return this.pos[1] };
  get z(): number { return this.pos[2] };
  get root(): Layout { return this._root }
  get level() { return this._level }
  get index() { return this._index }
  get state() { return this._state }
  get img_idx() { return this._img_idx() }
  get visible(): boolean { return this._visible() }
  get opacity() { return this._opacity() }
  get parent() { return this._parent; }
  get children() { return this._children; }
  set children(v) { this._children = v; }
  get size(): [number, number] { return [this.dst_rect[2], this.dst_rect[3]] }
  set size([w, h]: [number, number]) {
    this.dst_rect[2] = w;
    this.dst_rect[3] = h;
  }
  get w(): number { return this.dst_rect[2] }
  set w(v: number) { this.dst_rect[2] = v }
  get h(): number { return this.dst_rect[3] }
  set h(v: number) { this.dst_rect[3] = v }

  get material() { return this._mesh?.material };
  get components() { return this._components; }
  get style(): IStyle { return this.data.style || {} }

  get id_layout_map(): Map<string, Layout> { return this.root._id_layout_map! }
  get name_layout_map(): Map<string, Layout> { return this.root._name_layout_map! }

  constructor(lf2: LF2, data: ILayoutInfo, parent?: Layout) {
    this.lf2 = lf2;
    this.data = Object.freeze(data);
    this.center = read_nums(this.data.center, 2)
    this.pos = read_nums(this.data.pos, 3)
    this._parent = parent;
    this._root = parent ? parent.root : this;
    if (this._root === this) {
      this._id_layout_map = new Map();
      this._name_layout_map = new Map();
    }
  }
  hit(x: number, y: number): boolean {
    const [l, t, w, h] = this.dst_rect;
    return l <= x && t <= y && l + w >= x && t + h >= y;
  }

  on_mouse_leave() {
  }

  on_mouse_enter() {
  }

  on_mount() {
    this._state = {};
    this.init_sprite();

    for (const item of this.children)
      item.on_mount();

    const { enter } = this.data.actions || {};
    enter && actor.act(this, enter);

    for (const c of this._components) c.on_mount?.();

    if (this._mesh) {
      if (this._mesh.visible)
        this.on_show();
      else
        this.on_hide();
    }
  }

  on_unmount() {
    for (const c of this._components) c.on_unmount?.();

    const { leave } = this.data.actions || {};
    leave && actor.act(this, leave);

    for (const item of this.children)
      item.on_unmount()

    this._mesh?.removeFromParent();
  }

  on_show() {
    this._callbacks.emit('on_show')(this);
    for (const c of this._components) c.on_show?.();
  }

  on_hide() {
    this._callbacks.emit('on_hide')(this);
    for (const c of this._components) c.on_hide?.();
  }

  to_next_img() {
    const { img_idx, img_infos } = this;
    if (!img_infos?.length) return;
    this._img_idx = () => (img_idx + 1) % img_infos.length
  }

  static async cook(lf2: LF2, data: ILayoutInfo, get_val: ValGetter<Layout>, parent?: Layout) {
    const ret = new Layout(lf2, data, parent);
    await ret._cook_imgs(lf2);
    ret._cook_img_idx(get_val);
    ret._cook_data(get_val);
    ret._cook_rects();
    await ret._cook_component();

    if (ret.data.actions?.click) {
      if (ret.data.tab_type?.includes('lr')) ret.root._left_to_right!.push(ret);
      if (ret.data.tab_type?.includes('ud')) ret.root._top_to_bottom!.push(ret);
    }
    if (data.items)
      for (const raw_item of data.items) {
        const cooked_item = await Layout.cook(lf2, raw_item, get_val, ret);
        if (cooked_item.id) ret.id_layout_map.set(cooked_item.id, cooked_item);
        if (cooked_item.name) ret.name_layout_map.set(cooked_item.name, cooked_item);
        cooked_item._index = ret.children.length;
        cooked_item._level = ret.level + 1;
        ret.children.push(cooked_item);
      }
    if (!parent) {
      ret.size = [794, 450];
      ret.center = [0, 0];
      ret.pos = [0, -450, 0]
    }
    if (ret._root === ret) {
      ret.root._left_to_right!.sort((a, b) => a.pos[0] - b.pos[0]);
      ret.root._top_to_bottom!.sort((a, b) => a.pos[1] - b.pos[1]);
    }
    return ret;
  }

  private async _cook_component() {
    const { component } = this.data
    if (!component) return;
    for (const c of factory.create(this, component)) {
      this._components.add(c);
    }
  }

  private async _cook_imgs(lf2: LF2) {
    const { img, flip_x, flip_y } = this.data;
    do {
      if (!img) break;

      const img_paths = !is_arr(img) ? [img] : img.filter(v => v && is_str(v));
      if (!img_paths.length) break;

      const img_infos: TImageInfo[] = [];
      const [sx, sy, sw, sh] = read_nums(this.data.rect, 4)
      const preload = async (img_path: string) => {
        const img_key = [img_path, sx, sy, sw, sh, flip_x ? 1 : 0, flip_y ? 1 : 0].join('_')
        const img_info = this.lf2.img_mgr.find(img_key);
        if (img_info) return img_info;
        return await this.lf2.img_mgr.load_img(img_key, async () => img_path, (img, cvs, ctx) => {
          const w = sw || img.width;
          const h = sh || img.height;
          cvs.width = w;
          cvs.height = h;
          ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
        });
      };
      for (const p of img_paths) {
        if (!p) continue
        img_infos.push(await preload(p))
      }
      this.img_infos = img_infos;

    } while (0);

    const { txt, style } = this.data;
    do {
      if (!is_str(txt)) break;
      this.img_infos = [
        await this.lf2.img_mgr.load_text(txt, style)
      ]
    } while (0);
  }

  private _cook_data(get_val: ValGetter<Layout>) {
    const { visible, opacity } = this.data;

    if (is_str(visible)) {
      const func = new Expression<Layout>(visible, get_val).make();
      return this._visible = () => func(this);
    }
    if (is_bool(visible))
      return this._visible = () => visible;

    if (is_str(opacity)) {
      const func = get_val(opacity);
      return this._opacity = () => Number(func(this)) || 0;
    }
    if (is_num(opacity))
      return this._opacity = () => opacity;
  }

  private _cook_img_idx(get_val: ValGetter<Layout>) {
    const { img_infos } = this;
    if (!img_infos?.length) return;
    const { which } = this.data;
    if (is_str(which)) {
      const val = get_val(which)
      return this._img_idx = () => Number(val(this)) || 0;
    }
    if (is_num(which)) {
      const img_idx = which % img_infos.length
      return this._img_idx = () => img_idx;
    }
  }

  private _cook_rects() {
    const { w: img_w = 0, h: img_h = 0 } = this.img_infos?.[0] || {};
    const { size, center, pos, rect } = this.data

    const [sx, sy, sw, sh] = read_nums(rect, 4, [0, 0, img_w, img_h])
    const [w, h] = read_nums(size, 2, [sw, sh]);
    const [cx, cy] = read_nums(center, 2, [0, 0]);
    const [x, y] = read_nums(pos, 2, [0, 0]);

    // 宽或高其一为0时，使用原图宽高比例的计算之
    const dw = Math.floor(w ? w : sh ? h * sw / sh : 0)
    const dh = Math.floor(h ? h : sw ? w * sh / sw : 0)
    const dx = x - Math.floor(cx * dw)
    const dy = y - Math.floor(cy * dh)

    this.src_rect = [sx, sy, sw, sh];
    this.dst_rect = [dx, dy, dw, dh];
  }

  protected create_texture(): THREE.Texture | undefined {
    const img_idx = this.img_idx;
    const img_info = this.img_infos?.[img_idx];
    if (!img_info) return void 0;
    const { flip_x, flip_y } = this.data
    const texture = this.lf2.img_mgr.create_pic_by_img_info(img_info).texture;
    texture.offset.set(flip_x ? 1 : 0, flip_y ? 1 : 0);
    return texture;
  }

  protected _mesh?: THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>;
  get mesh() { return this._mesh }

  protected init_sprite() {
    const [cx, cy] = this.center;
    const [x, y] = this.pos;
    const [w, h] = this.size;
    const texture = this.create_texture();

    const params: THREE.MeshBasicMaterialParameters = {
      transparent: true
    };
    if (texture) params.map = texture;
    else if (this.data.bg_color) params.color = this.data.bg_color;
    else this._opacity = () => 0.

    this._mesh = LayoutMeshBuilder
      .create()
      .center(cx, cy)
      .size(w, h)
      .pos(x, -y)
      .z(this.z)
      .build(params)

    this._mesh.name = `layout(name = ${this.name}, id =${this.id})`
    this._mesh.userData = { owner: this };
    this._mesh.visible = this.visible;
    (this.parent?.mesh || this.lf2.world.scene)?.add(this._mesh);
  }

  on_click(): boolean {
    const { click } = this.data.actions ?? {};
    click && actor.act(this, click);
    for (const c of this._components) {
      if (c.on_click?.()) break;
    }
    return !!click;
  }

  on_render(dt: number) {
    const mesh = this.mesh;
    if (mesh) {
      if (this._root === this) {
        mesh.position.x = this.lf2.world.camera.position.x
      }
      const { visible } = this;
      if (mesh.visible !== visible) {
        mesh.visible = visible
        if (visible)
          this.on_show();
        else
          this.on_hide();
      }
    }
    if (this.material) {
      const next_opacity = this.opacity;
      if (next_opacity >= 0) {
        this.material.opacity = next_opacity;
      } else if (this._opacity_animation) {
        this.material.opacity = this._opacity_animation.update(dt);
      }
    }
    for (const i of this.children) i.on_render(dt);
    for (const c of this._components) c.on_render?.(dt);
  }

  on_player_key_down(player_id: string, key: TKeyName) {
    for (const i of this.children) i.on_player_key_down?.(player_id, key);
    for (const c of this._components) c.on_player_key_down?.(player_id, key);
    const lr_items = this._left_to_right.filter(v => v.visible);
    const lr_lengh = lr_items.length;

    if (lr_lengh) {
      switch (key) {
        case 'L': { // 聚点移动至下一layout（向左）
          const idx = lr_items.findIndex(v => v === this._focused_item);
          this._focused_item = lr_items[(Math.max(idx, 0) + lr_lengh - 1) % lr_lengh];
          break;
        }
        case 'R': { // 聚点移动至下一layout（向右）
          const idx = lr_items.findIndex(v => v === this._focused_item);
          this._focused_item = lr_items[(idx + 1) % lr_lengh];
          break;
        }
      }
    }

    const ud_items = this._top_to_bottom.filter(v => v.visible);
    const ud_lengh = ud_items.length;
    if (ud_lengh) {
      switch (key) {
        case 'U': { // 聚点移动至下一layout（向上）
          const idx = ud_items.findIndex(v => v === this._focused_item);
          this._focused_item = ud_items[(Math.max(idx, 0) + ud_lengh - 1) % ud_lengh];
          break;
        }
        case 'D': { // 聚点移动至下一layout（向下）
          const idx = ud_items.findIndex(v => v === this._focused_item);
          this._focused_item = ud_items[(idx + 1) % ud_lengh];
          break;
        }
      }
    }

    switch (key) {
      case 'a': {
        this._focused_item?.on_click();
        break;
      }
      case 'j':
        break;
      case 'd':
        break;
    }
  }

  find_layout(id: string): Layout | undefined {
    return this.id_layout_map.get(id);
  }

  find_layout_by_name(name: string): Layout | undefined {
    return this.name_layout_map.get(name);
  }

  get_value(name: string, lookup: boolean = true): any {
    const { values } = this.data;
    if (values && name in values)
      return values[name];
    if (lookup && this.parent)
      return this.parent.get_value(name, lookup)
    return void 0;
  }
}