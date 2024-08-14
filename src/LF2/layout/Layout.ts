import * as THREE from 'three';
import { ISpriteInfo, ISpriteNode } from '../3d';
import LF2 from '../LF2';
import Callbacks from '../base/Callbacks';
import Expression, { ValGetter } from '../base/Expression';
import { NoEmitCallbacks } from '../base/NoEmitCallbacks';
import GameKey from '../defines/GameKey';
import IStyle from '../defines/IStyle';
import Ditto from '../ditto';
import { empty_texture, white_texture, type TImageInfo } from '../loader/loader';
import { filter, find } from '../utils/container_help';
import { is_arr, is_bool, is_num, is_str } from '../utils/type_check';
import type { ILayoutInfo } from './ILayoutInfo';
import StateDelegate from './StateDelegate';
import actor from './action/Actor';
import factory from './component/Factory';
import { LayoutComponent } from './component/LayoutComponent';
import read_nums from './utils/read_nums';

export interface ICookedLayoutInfo extends ILayoutInfo {
  pos: [number, number, number];
  center: [number, number, number];
  rect: [number, number, number, number];
  parent?: ICookedLayoutInfo;
  items?: ICookedLayoutInfo[];
  img_infos: TImageInfo[];
  size: [number, number];
  left_top: [number, number];
}

export interface ILayoutCallback {
  on_click?(): void;
  on_show?(layout: Layout): void;
  on_hide?(layout: Layout): void;
  on_foucs_changed?(layout: Layout): void;
  on_foucs_item_changed?(foucs: Layout | undefined, blur: Layout | undefined): void;
}
export default class Layout {
  protected _callbacks = new Callbacks<ILayoutCallback>();
  get callbacks(): NoEmitCallbacks<ILayoutCallback> { return this._callbacks }
  /**
   * 根节点
   *
   * @protected
   * @type {Layout}
   */
  protected _root: Layout;
  protected _focused_item?: Layout;
  readonly id_layout_map: Map<string, Layout>;
  readonly name_layout_map: Map<string, Layout>;

  protected _pos: StateDelegate<[number, number, number]> = new StateDelegate(() => this.data.pos)
  protected _components = new Set<LayoutComponent>();
  protected _state: any = {}
  protected _visible: StateDelegate<boolean> = new StateDelegate(true);
  protected _disabled: StateDelegate<boolean> = new StateDelegate(false);
  protected _opacity: StateDelegate<number> = new StateDelegate(1);
  protected _img_infos: StateDelegate<TImageInfo[]> = new StateDelegate([]);
  protected _size: StateDelegate<[number, number]> = new StateDelegate([0, 0]);
  protected _center: StateDelegate<[number, number, number]> = new StateDelegate([0, 0, 0]);

  protected _img_idx = () => 0;
  protected _parent?: Layout;
  protected _children: Layout[] = [];
  protected _index: number = 0;
  protected readonly data: Readonly<ICookedLayoutInfo>;

  lf2: LF2;
  get focused(): boolean {
    return this._root._focused_item === this;
  }
  set focused(v: boolean) {
    if (v)
      this.focused_item = this;
    else if (this.focused_item === this)
      this.focused_item = void 0
  }
  get focused_item(): Layout | undefined {
    return this._root._focused_item
  }
  set focused_item(val: Layout | undefined) {
    const old = this._root._focused_item
    if (old === val) return;
    this._root._focused_item = val;
    if (old) {
      old.on_blur();
      old._callbacks.emit('on_foucs_changed')(old);
    }
    if (val) {
      val.on_foucs();
      val._callbacks.emit('on_foucs_changed')(val);
    }
    this._root._callbacks.emit('on_foucs_item_changed')(val, old)
  }


  get id(): string | undefined { return this.data.id }
  get name(): string | undefined { return this.data.name }
  get pos(): [number, number, number] { return this._pos.value };
  set pos(v: [number, number, number]) { this.set_pos(v) }
  set_pos(v: [number, number, number]): this {
    this._pos.set(0, v);
    this._sprite.set_position(v[0], -v[1], v[2])
    return this;
  }

  get x(): number { return this.pos[0] };
  set x(v: number) { this.set_x(v); }
  set_x(x: number): this {
    const [, y, z] = this.pos;
    return this.set_pos([x, y, z])
  }

  get y(): number { return this.pos[1] };
  set y(v: number) { this.set_y(v); }
  set_y(y: number): this {
    const [x, , z] = this.pos;
    return this.set_pos([x, y, z])
  }

  get z(): number { return this.pos[2] };
  set z(z: number) { this.set_z(z); }
  set_z(z: number): this {
    const [x, y] = this.pos;
    return this.set_pos([x, y, z])
  }

  get root(): Layout { return this._root }

  get depth() {
    let depth = 0;
    let l: Layout | undefined = this;
    for (; l?._parent; l = l.parent)
      ++depth
    return depth;
  }
  get index() { return this._index }
  get state() { return this._state }
  get img_idx() { return this._img_idx() }

  get visible(): boolean { return this._visible.value; }
  set visible(v: boolean) { this.set_visible(v); }
  set_visible(v: boolean): this { this._visible.set(0, v); return this; }

  get disabled(): boolean { return this._disabled.value; }
  set disabled(v: boolean) { this.set_disabled(v); }
  set_disabled(v: boolean): this { this._disabled.set(0, v); return this; }

  get center() { return this._center.value; }
  set center(v: [number, number, number]) { this.set_center(v); }
  set_center(v: [number, number, number]): this { this._center.set(0, v); return this; }

  get opacity(): number { return this._opacity.value }
  set opacity(v: number) { this.set_opacity(v) }
  set_opacity(v: number): this { this._opacity.set(0, v); return this }

  get parent() { return this._parent; }
  get children() { return this._children; }
  set children(v) { this._children = v; }

  get size(): [number, number] { return this._size.value }
  set size(v: [number, number]) { this.set_size(v); }
  set_size(v: [number, number]): this { this._size.set(0, v); return this; }

  get w(): number { return this.size[0]; }
  set w(v: number) { this.set_w(v); }
  set_w(v: number): this { return this.set_size([v, this.h]); }

  get h(): number { return this.size[1]; }
  set h(v: number) { this.set_h(v); }
  set_h(v: number): this { return this.set_size([this.w, v]); }

  get components() { return this._components; }
  get style(): IStyle { return this.data.style || {} }

  get img_infos() { return this._img_infos.value }
  set img_infos(v: TImageInfo[]) { this.set_img_infos(v); }
  set_img_infos(v: TImageInfo[]): this { this._img_infos.set(0, v); return this; }

  protected _sprite: ISpriteNode;

  constructor(lf2: LF2, data: ICookedLayoutInfo, parent?: Layout) {
    this.lf2 = lf2;
    this._sprite = new Ditto.SpriteNode(this.lf2)
      .add_user_data('owner', this)
    this.data = Object.freeze(data);
    this._parent = parent;
    this._root = parent ? parent.root : this;
    if (this._root === this) {
      this.id_layout_map = new Map();
      this.name_layout_map = new Map();
    }

    this.id_layout_map = parent?.id_layout_map ?? new Map();
    this.name_layout_map = parent?.name_layout_map ?? new Map();
  }

  get x_on_root(): number {
    let x = 0;
    let node: Layout | undefined = this;
    do {
      x += node.x;
      node = node.parent;
    } while (node)
    return x;
  }
  get y_on_root(): number {
    let ret = 0;
    let node: Layout | undefined = this;
    do {
      ret += node.y;
      node = node.parent;
    } while (node)
    return ret;
  }

  hit(x: number, y: number): boolean {
    const [l, t] = this.data.left_top;
    const [w, h] = this.data.size;
    return l <= x && t <= y && l + w >= x && t + h >= y;
  }

  on_mouse_leave() {
  }

  on_mouse_enter() {
  }

  on_start() {
    this._state = {};
    this.init_sprite();
    for (const c of this._components) c.on_start?.();
    for (const i of this.children) i.on_start();

    const { start } = this.data.actions || {};
    start && actor.act(this, start);
  }

  on_stop(): void {
    for (const c of this.components) c.on_stop?.();
    for (const l of this.children) l.on_stop();
    this.parent?.sprite.del(this._sprite);

    const { stop } = this.data.actions || {};
    stop && actor.act(this, stop);
  }

  on_resume() {
    if (!this.parent) {
      this.focused_item = this._state.focused_item;
    }
    if (this.root === this) this.lf2.world.scene.add(this.sprite);

    for (const c of this._components) c.on_resume?.();
    for (const i of this.children) i.on_resume();

    const { resume } = this.data.actions || {};
    resume && actor.act(this, resume);

    for (const c of this._components) c.on_after_resume?.();
    this.invoke_visible_callback()

  }

  on_pause() {
    if (!this.parent) {
      this._state.focused_item = this.focused_item;
      console.log('on_pause focused_item', this.focused_item)
    }
    if (this.root === this) this._sprite.del_self();

    if (this.global_visible && !this.parent)
      this.invoke_all_on_hide();

    const { pause } = this.data.actions || {};
    pause && actor.act(this, pause);
    for (const c of this._components) c.on_pause?.();
    for (const item of this.children) item.on_pause();
  }

  on_show() {
    for (const c of this.components) c.on_show?.();
    this._callbacks.emit('on_show')(this);
    if (this.data.auto_focus && !this.global_disabled && !this.focused_item)
      this.focused_item = this
  }

  on_hide() {
    if (this.focused_item === this)
      this.focused_item = void 0;
    for (const c of this.components) c.on_hide?.();
    this._callbacks.emit('on_hide')(this);
  }

  to_next_img() {
    const { img_idx, img_infos } = this;
    if (!img_infos?.length) return;
    this._img_idx = () => (img_idx + 1) % img_infos.length
  }

  static async cook_layout_info(lf2: LF2, data_or_path: ILayoutInfo | string, parent?: ICookedLayoutInfo): Promise<ICookedLayoutInfo> {

    let raw_info = is_str(data_or_path) ? await lf2.import_json<ILayoutInfo>(data_or_path) : data_or_path;

    if (parent && raw_info.template) {
      const raw_template_data = await lf2.import_json<ILayoutInfo>(raw_info.template);
      Object.assign(raw_template_data, raw_info);
      delete raw_template_data.template
      const cooked_template_data = await this.cook_layout_info(lf2, raw_template_data, parent);
      raw_info = { ...cooked_template_data, ...raw_info }
    }

    const ret: ICookedLayoutInfo = {
      ...raw_info,
      pos: read_nums(raw_info.pos, 3, parent ? void 0 : [0, -450, 0]),
      center: read_nums(raw_info.center, 3, [0, 0, 0]),
      rect: read_nums(raw_info.rect, 4),
      size: [0, 0],
      left_top: [0, 0],
      parent: parent,
      img_infos: [],
      items: void 0
    }

    const { img, txt, style } = raw_info;
    if (img) {
      const img_paths = !is_arr(img) ? [img] : img.filter(v => v && is_str(v));
      const [sx, sy, sw, sh] = ret.rect;
      const preload = async (img_path: string) => {
        const img_key = `${img_path}?${sx}_${sy}_${sw}_${sh}`;
        const img_info = lf2.images.find(img_key);
        if (img_info) return img_info;
        return await lf2.images.load_img(img_key, img_path, (img, cvs, ctx) => {
          const w = cvs.width = sw || img.width;
          const h = cvs.height = sh || img.height;
          ctx.drawImage(img, sx, sy, w, h, 0, 0, w, h);
        });
      };
      for (const p of img_paths) {
        if (p) ret.img_infos.push(await preload(p))
      }
    } else if (is_str(txt)) {
      ret.img_infos.push(await lf2.images.load_text(txt, style))
    }

    {
      const { w: img_w = 0, h: img_h = 0, scale = 1 } = ret.img_infos?.[0] || {};
      const { size, center, pos, rect } = raw_info

      const [sx, sy, sw, sh] = read_nums(rect, 4, [0, 0, img_w / scale, img_h / scale])
      const [w, h] = read_nums(size, 2, [parent ? sw : 794, parent ? sh : 450]);
      const [cx, cy] = read_nums(center, 2, [0, 0]);
      const [x, y] = read_nums(pos, 2, [0, 0]);

      // 宽或高其一为0时，使用原图宽高比例的计算之
      const dw = Math.floor(w ? w : sh ? h * sw / sh : 0)
      const dh = Math.floor(h ? h : sw ? w * sh / sw : 0)
      const dx = x - Math.floor(cx * dw)
      const dy = y - Math.floor(cy * dh)
      ret.rect = [sx, sy, sw, sh];
      ret.size = [dw, dh];
      ret.left_top = [dx, dy];
    }

    if (Array.isArray(raw_info.items) && raw_info.items.length) {
      ret.items = [];
      for (const item of raw_info.items)
        ret.items.push(await Layout.cook_layout_info(lf2, item, ret))
    } else {
      delete ret.items;
    }
    return ret;
  }

  static cook(lf2: LF2, info: ICookedLayoutInfo, get_val: ValGetter<Layout>, parent?: Layout) {

    const ret = new Layout(lf2, info, parent);
    ret._cook_img_idx(get_val);
    ret._cook_data(get_val);
    ret._cook_component();

    if (info.items)
      for (const item_info of info.items) {
        const cooked_item = Layout.cook(lf2, item_info, get_val, ret);
        if (cooked_item.id) ret.id_layout_map.set(cooked_item.id, cooked_item);
        if (cooked_item.name) ret.name_layout_map.set(cooked_item.name, cooked_item);
        cooked_item._index = ret.children.length;
        ret.children.push(cooked_item);
      }
    return ret;
  }

  private _cook_component() {
    const { component } = this.data
    if (!component) return;
    for (const c of factory.create(this, component)) {
      this._components.add(c);
    }
  }

  private _cook_data(get_val: ValGetter<Layout>) {
    const { visible, opacity, disabled } = this.data;

    if (is_bool(disabled)) {
      this._disabled.default_value = disabled;
    } else if (is_str(disabled)) {
      const func = new Expression<Layout>(disabled, get_val).make();
      this._disabled.default_value = () => func(this);
    }

    if (is_bool(visible)) {
      this._visible.default_value = visible;
    } else if (is_str(visible)) {
      const func = new Expression<Layout>(visible, get_val).make();
      this._visible.default_value = () => func(this);
    }

    if (is_num(opacity)) {
      this._opacity.default_value = opacity;
    } else if (is_str(opacity)) {
      const func = get_val(opacity);
      this._opacity.default_value = () => Number(func(this)) || 0;
    }

    this._img_infos.default_value = this.data.img_infos;
    this._size.default_value = this.data.size;
    this._center.default_value = this.data.center;
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


  protected create_texture(): THREE.Texture | undefined {
    const img_idx = this.img_idx;
    const img_info = this.img_infos?.[img_idx];
    if (!img_info) return this.data.bg_color ? white_texture() : empty_texture();
    const { flip_x, flip_y } = this.data
    const texture = this.lf2.images.create_pic_by_img_info(img_info).texture;
    texture.offset.set(flip_x ? 1 : 0, flip_y ? 1 : 0);
    return texture;
  }

  get sprite() { return this._sprite }

  protected init_sprite() {
    const [x, y, z] = this.data.pos;
    const [w, h] = this.size;
    const texture = this.create_texture();
    const p: ISpriteInfo = {
      w, h, texture, color: this.data.bg_color
    }
    this._sprite.set_info(p)
      .set_center(...this.center)
      .set_position(x, -y, z)
      .set_opacity((p.texture || p.color) ? 1 : 0)
      .set_visible(this.visible)
      .set_name(`layout(name= ${this.name}, id=${this.id})`)
      .apply()
    this.parent?.sprite.add(this._sprite);
  }

  on_click(): boolean {
    const { click } = this.data.actions ?? {};
    click && actor.act(this, click);
    for (const c of this._components) c.on_click?.()
    return !!click;
  }

  get global_visible(): boolean {
    if (!this.visible) return false;
    return this.parent ? this.parent.global_visible : true;
  }

  get global_disabled(): boolean {
    if (this.disabled) return true;
    return !!this.parent?.global_disabled;
  }

  get global_z(): number {
    let global_z = 0;
    let l: Layout | undefined = this;
    for (; l?._parent; l = l.parent)
      global_z += this.sprite.z;
    return global_z;
  }

  invoke_all_on_show() {
    this.on_show();
    for (const child of this.children) {
      if (child.visible) child.invoke_all_on_show();
    }
  }

  invoke_all_on_hide() {
    this.on_hide();
    for (const child of this.children) {
      if (child.visible) child.invoke_all_on_hide();
    }
  }

  invoke_visible_callback() {
    if (this.global_visible) {
      this.invoke_all_on_show();
    } else if (!this.parent || this.parent.global_visible) {
      this.invoke_all_on_hide();
    }
  }

  on_render(dt: number) {
    if (this._root === this)
      this._sprite.x = this.lf2.world.camera.x

    const { visible } = this;
    if (visible !== this._sprite.visible) {
      this._sprite.visible = visible;
      this.invoke_visible_callback();
    }
    this._sprite.opacity = this.opacity;

    for (const i of this.children)
      i.on_render(dt)
    for (const c of this._components)
      c.on_render?.(dt)
  }

  on_player_key_down(player_id: string, key: GameKey) {
    for (const i of this.children) i.on_player_key_down(player_id, key);
    for (const c of this._components) c.on_player_key_down?.(player_id, key);
    if ('a' === key) this._focused_item?.on_click();
  }

  on_player_key_up(player_id: string, key: GameKey) {
    for (const i of this.children) i.on_player_key_up(player_id, key);
    for (const c of this._components) c.on_player_key_up?.(player_id, key);
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

  /**
   * 查找当前layout符合条件的的component
   * @param type 
   * @param condition 
   * @returns 
   */
  find_component<T extends TCls>(type: T, condition: TCond<T> = () => 1): InstanceType<T> | undefined {
    return find(this.components, v => v instanceof type && condition(v as any)) as InstanceType<T> | undefined
  }

  /**
   * 查找当前layout符合条件的的component数组
   * @param type 
   * @param condition 
   * @returns 
   */
  find_components<T extends TCls>(type: T, condition: TCond<T> = () => 1): InstanceType<T>[] {
    return filter(this.components, v => v instanceof type && condition(v as any)) as InstanceType<T>[]
  }

  /**
   * 查找当前layout以及子layout符合条件的component
   * @param type 
   * @param condition 
   * @returns 
   */
  search_component<T extends TCls>(type: T, condition: TCond<T> = () => 1): InstanceType<T> | undefined {
    const ret = this.find_component(type, condition);
    if (ret) return ret;
    for (const i of this._children) {
      const ret = i.search_component(type, condition);
      if (ret) return ret;
    }
  }

  /**
   * 查找当前layout以及子layout符合条件的component数组
   * @param type 
   * @param condition 
   * @returns 
   */
  search_components<T extends TCls>(type: T, condition: TCond<T> = () => 1): InstanceType<T>[] {
    const ret = this.find_components(type, condition);
    for (const i of this._children)
      ret.push(...i.search_components(type, condition))
    return ret;
  }

  lookup_component<T extends TCls>(type: T, condition: TCond<T> = () => 1): InstanceType<T> | undefined {
    const ret = this.find_component(type, condition);
    if (ret) return ret;
    return this.parent?.lookup_component(type, condition);
  }

  on_foucs(): void {
    for (const c of this._components) c.on_foucs?.();
  }
  on_blur(): void {
    for (const c of this._components) c.on_blur?.();
  }

}
type TCls<R = any> = abstract new (...args: any) => R;
type TCond<T extends TCls> = (c: InstanceType<T>) => unknown;