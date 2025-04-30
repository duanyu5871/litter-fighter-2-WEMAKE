import * as THREE from "three";
import { ISprite, ISpriteInfo } from "../3d";
import LF2 from "../LF2";
import Callbacks from "../base/Callbacks";
import { Expression } from "../base/Expression";
import { NoEmitCallbacks } from "../base/NoEmitCallbacks";
import GameKey from "../defines/GameKey";
import { IValGetter } from "../defines/IExpression";
import IStyle from "../defines/IStyle";
import Ditto from "../ditto";
import { type IImageInfo } from "../loader/IImageInfo";
import {
  empty_texture,
  white_texture,
} from "../loader/loader";
import { filter, find } from "../utils/container_help";
import { is_arr, is_bool, is_num, is_str } from "../utils/type_check";
import { ICookedLayoutInfo } from "./ICookedLayoutInfo";
import { ILayoutCallback } from "./ILayoutCallback";
import type { ILayoutInfo } from "./ILayoutInfo";
import StateDelegate from "./StateDelegate";
import actor from "./action/Actor";
import { Component } from "./component/Component";
import factory from "./component/Factory";
import read_nums from "./utils/read_nums";

export class Node {
  readonly lf2: LF2;
  readonly id_layout_map: Map<string, Node>;
  readonly name_layout_map: Map<string, Node>;

  protected _callbacks = new Callbacks<ILayoutCallback>();
  get callbacks(): NoEmitCallbacks<ILayoutCallback> {
    return this._callbacks;
  }
  /**
   * 根节点
   *
   * @protected
   * @type {Node}
   */
  protected _root: Node;
  protected _focused_item?: Node;
  protected _pos: StateDelegate<[number, number, number]> = new StateDelegate(
    () => this.data.pos,
  );
  protected _components = new Set<Component>();
  protected _state: any = {};
  protected _visible: StateDelegate<boolean> = new StateDelegate(true);
  protected _disabled: StateDelegate<boolean> = new StateDelegate(false);
  protected _opacity: StateDelegate<number> = new StateDelegate(1);
  protected _img_infos: StateDelegate<IImageInfo[]> = new StateDelegate([]);
  protected _size: StateDelegate<[number, number]> = new StateDelegate([0, 0]);
  protected _center: StateDelegate<[number, number, number]> =
    new StateDelegate([0, 0, 0]);

  protected _img_idx = () => 0;
  protected _parent?: Node;
  protected _children: Node[] = [];
  protected _index: number = 0;
  protected readonly data: Readonly<ICookedLayoutInfo>;

  get focused(): boolean {
    return this._root._focused_item === this;
  }
  set focused(v: boolean) {
    if (v) this.focused_item = this;
    else if (this.focused_item === this) this.focused_item = void 0;
  }
  get focused_item(): Node | undefined {
    return this._root._focused_item;
  }
  set focused_item(val: Node | undefined) {
    const old = this._root._focused_item;
    if (old === val) return;
    this._root._focused_item = val;
    if (old) {
      old.on_blur();
      old._callbacks.emit("on_foucs_changed")(old);
    }
    if (val) {
      val.on_foucs();
      val._callbacks.emit("on_foucs_changed")(val);
    }
    this._root._callbacks.emit("on_foucs_item_changed")(val, old);
  }

  get id(): string | undefined {
    return this.data.id;
  }
  get name(): string | undefined {
    return this.data.name;
  }
  get pos(): [number, number, number] {
    return this._pos.value;
  }
  set pos(v: [number, number, number]) {
    this.set_pos(v);
  }
  set_pos(v: [number, number, number]): this {
    this._pos.set(1, v);
    this._sprite.set_position(v[0], -v[1], v[2]);
    return this;
  }

  get x(): number {
    return this.pos[0];
  }
  set x(v: number) {
    this.set_x(v);
  }
  set_x(x: number): this {
    const [, y, z] = this.pos;
    return this.set_pos([x, y, z]);
  }

  get y(): number {
    return this.pos[1];
  }
  set y(v: number) {
    this.set_y(v);
  }
  set_y(y: number): this {
    const [x, , z] = this.pos;
    return this.set_pos([x, y, z]);
  }

  get z(): number {
    return this.pos[2];
  }
  set z(z: number) {
    this.set_z(z);
  }
  set_z(z: number): this {
    const [x, y] = this.pos;
    return this.set_pos([x, y, z]);
  }

  get root(): Node {
    return this._root;
  }

  get depth() {
    let depth = 0;
    let l: Node | undefined = this;
    for (; l?._parent; l = l.parent) ++depth;
    return depth;
  }

  get index() {
    return this._index;
  }

  get state() {
    return this._state;
  }

  get img_idx() {
    return this._img_idx();
  }

  set img_idx(v: number) {
    this._img_idx = () => v;
  }

  get visible(): boolean {
    return this._visible.value;
  }

  set visible(v: boolean) {
    this.set_visible(v);
  }

  set_visible(v: boolean): this {
    this._visible.set(1, v);
    return this;
  }

  get disabled(): boolean {
    return this._disabled.value;
  }
  set disabled(v: boolean) {
    this.set_disabled(v);
  }
  set_disabled(v: boolean): this {
    this._disabled.set(1, v);
    return this;
  }

  get center() {
    return this._center.value;
  }
  set center(v: [number, number, number]) {
    this.set_center(v);
  }
  set_center(v: [number, number, number]): this {
    this._center.set(1, v);
    return this;
  }

  get opacity(): number {
    return this._opacity.value;
  }
  set opacity(v: number) {
    this.set_opacity(v);
  }
  set_opacity(v: number): this {
    this._opacity.set(1, v);
    return this;
  }

  get parent() { return this._parent; }
  get children(): Readonly<Node[]> { return this._children; }

  get size(): [number, number] { return this._size.value; }
  set size(v: [number, number]) { this.set_size(v); }

  get w(): number { return this.size[0]; }
  set w(v: number) { this.set_w(v); }

  get h(): number { return this.size[1]; }
  set h(v: number) { this.set_h(v); }


  set_size(v: [number, number]): this { this._size.set(1, v); return this; }
  set_w(v: number): this { return this.set_size([v, this.h]); }
  set_h(v: number): this { return this.set_size([this.w, v]); }

  get components() {
    return this._components;
  }
  get style(): IStyle {
    return this.data.style || {};
  }

  get img_infos() {
    return this._img_infos.value;
  }
  set img_infos(v: IImageInfo[]) {
    this.set_img_infos(v);
  }
  set_img_infos(v: IImageInfo[]): this {
    this._img_infos.set(1, v);
    return this;
  }

  protected _sprite: ISprite;

  constructor(lf2: LF2, data: ICookedLayoutInfo, parent?: Node) {
    this.lf2 = lf2;
    this.data = Object.freeze(data);
    this._parent = parent;
    this._root = parent?.root ?? this;
    this.id_layout_map = parent?.id_layout_map ?? new Map();
    this.name_layout_map = parent?.name_layout_map ?? new Map();

    this._sprite = new Ditto.SpriteNode(this.lf2).add_user_data("owner", this);
  }

  get x_on_root(): number {
    let x = 0;
    let node: Node | undefined = this;
    do {
      x += node.x;
      node = node.parent;
    } while (node);
    return x;
  }

  get y_on_root(): number {
    let ret = 0;
    let node: Node | undefined = this;
    do {
      ret += node.y;
      node = node.parent;
    } while (node);
    return ret;
  }

  hit(x: number, y: number): boolean {
    const [l, t] = this.data.left_top;
    const [w, h] = this.data.size;
    return l <= x && t <= y && l + w >= x && t + h >= y;
  }

  on_mouse_leave() { }

  on_mouse_enter() { }

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

    this.invoke_visible_callback();
  }

  on_pause() {
    if (!this.parent) {
      this._state.focused_item = this.focused_item;
      console.log("on_pause focused_item", this.focused_item);
    }
    if (this.root === this) this._sprite.del_self();

    if (this.global_visible && !this.parent) this.invoke_all_on_hide();

    const { pause } = this.data.actions || {};
    pause && actor.act(this, pause);
    for (const c of this._components) c.on_pause?.();
    for (const item of this.children) item.on_pause();
  }

  on_show() {
    for (const c of this.components) c.on_show?.();
    this._callbacks.emit("on_show")(this);
    if (this.data.auto_focus && !this.global_disabled && !this.focused_item)
      this.focused_item = this;
  }

  on_hide() {
    if (this.focused_item === this) this.focused_item = void 0;
    for (const c of this.components) c.on_hide?.();
    this._callbacks.emit("on_hide")(this);
  }

  to_next_img() {
    const { img_idx, img_infos } = this;
    if (!img_infos?.length) return;
    this._img_idx = () => (img_idx + 1) % img_infos.length;
  }

  static async cook_layout_info(
    lf2: LF2,
    data_or_path: ILayoutInfo | string,
    parent?: ICookedLayoutInfo,
  ): Promise<ICookedLayoutInfo> {
    let raw_info = is_str(data_or_path)
      ? await lf2.import_json<ILayoutInfo>(data_or_path)
      : data_or_path;

    if (parent && raw_info.template) {
      const raw_template_data = await lf2.import_json<ILayoutInfo>(
        raw_info.template,
      );
      Object.assign(raw_template_data, raw_info);
      delete raw_template_data.template;
      const cooked_template_data = await this.cook_layout_info(
        lf2,
        raw_template_data,
        parent,
      );
      raw_info = { ...cooked_template_data, ...raw_info };
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
      items: void 0,
    };
    const { img, txt, style } = raw_info;
    if (img) {
      const img_paths = !is_arr(img)
        ? [img]
        : img.filter((v) => v && is_str(v));
      const [sx, sy, sw, sh] = ret.rect;
      const preload = async (img_path: string) => {
        const img_key = `${img_path}?${sx}_${sy}_${sw}_${sh}`;
        const img_info = lf2.images.find(img_key);
        if (img_info) return img_info;

        return await lf2.images.load_img(img_key, img_path, [{
          type: 'crop',
          x: sx,
          y: sy,
          w: sw,
          h: sh
        }]);
      };
      for (const p of img_paths) {
        if (p) ret.img_infos.push(await preload(p));
      }
    } else if (is_str(txt)) {
      ret.img_infos.push(await lf2.images.load_text(txt, style));
    }
    {
      const {
        w: img_w = 0,
        h: img_h = 0,
        scale = 1,
      } = ret.img_infos?.[0] || {};
      const { size, center, pos, rect } = raw_info;

      const [sx, sy, sw, sh] = read_nums(rect, 4, [
        0,
        0,
        img_w / scale,
        img_h / scale,
      ]);
      const [w, h] = read_nums(size, 2, [parent ? sw : 794, parent ? sh : 450]);
      const [cx, cy] = read_nums(center, 2, [0, 0]);
      const [x, y] = read_nums(pos, 2, [0, 0]);

      // 宽或高其一为0时，使用原图宽高比例的计算之
      const dw = Math.floor(w ? w : sh ? (h * sw) / sh : 0);
      const dh = Math.floor(h ? h : sw ? (w * sh) / sw : 0);
      const dx = x - Math.floor(cx * dw);
      const dy = y - Math.floor(cy * dh);
      ret.rect = [sx, sy, sw, sh];
      ret.size = [dw, dh];
      ret.left_top = [dx, dy];
    }

    if (Array.isArray(raw_info.items) && raw_info.items.length) {
      ret.items = [];
      for (const item of raw_info.items)
        ret.items.push(await Node.cook_layout_info(lf2, item, ret));
    } else {
      delete ret.items;
    }
    return ret;
  }

  static cook(
    lf2: LF2,
    info: ICookedLayoutInfo,
    get_val: IValGetter<Node>,
    parent?: Node,
  ) {
    const ret = new Node(lf2, info, parent);
    ret._cook_data(get_val);
    ret._cook_img_idx(get_val);
    ret._cook_component();

    if (info.items) {
      for (const item_info of info.items) {
        const cooked_item = Node.cook(lf2, item_info, get_val, ret);
        if (cooked_item.id) ret.id_layout_map.set(cooked_item.id, cooked_item);
        if (cooked_item.name)
          ret.name_layout_map.set(cooked_item.name, cooked_item);
        cooked_item._index = ret.children.length;
        ret.add_child(cooked_item)
      }
    }
    return ret;
  }

  add_child(layout: Node): this {
    this._children.push(layout);
    return this;
  }

  add_children(...layout: Node[]): this {
    layout.forEach(l => this.add_child(l))
    return this;
  }

  private _cook_component() {
    const { component } = this.data;
    if (!component) return;
    for (const c of factory.create(this, component)) {
      this._components.add(c);
    }
  }

  private _cook_data(get_val: IValGetter<Node>) {
    const { visible, opacity, disabled } = this.data;

    if (is_bool(disabled)) {
      this._disabled.default_value = disabled;
    } else if (is_str(disabled)) {
      const func = new Expression<Node>(disabled, get_val).run;
      this._disabled.default_value = () => func(this);
    }

    if (is_bool(visible)) {
      this._visible.default_value = visible;
    } else if (is_str(visible)) {
      const func = new Expression<Node>(visible, get_val).run;
      this._visible.default_value = () => func(this);
    }

    if (is_num(opacity)) {
      this._opacity.default_value = opacity;
    } else if (is_str(opacity)) {
      this._opacity.default_value = () =>
        Number(get_val(this, opacity, "==")) || 0;
    }

    this._img_infos.default_value = this.data.img_infos;
    this._size.default_value = this.data.size;
    this._center.default_value = this.data.center;
  }

  private _cook_img_idx(get_val: IValGetter<Node>) {
    const { img_infos } = this;
    if (!img_infos?.length) return;
    const { which } = this.data;
    if (is_str(which)) {
      return (this._img_idx = () => Number(get_val(this, which, "==")) || 0);
    }
    if (is_num(which)) {
      const img_idx = which % img_infos.length;
      return (this._img_idx = () => img_idx);
    }
  }

  protected create_texture(): THREE.Texture | undefined {
    const img_idx = this.img_idx;
    const img_info = this.img_infos?.[img_idx];
    if (!img_info)
      return this.data.bg_color ? white_texture() : empty_texture();
    const { flip_x, flip_y } = this.data;
    const texture = this.lf2.images.create_pic_by_img_info(img_info).texture;
    texture.offset.set(flip_x ? 1 : 0, flip_y ? 1 : 0);
    return texture;
  }

  get sprite() {
    return this._sprite;
  }

  protected init_sprite() {
    const [x, y, z] = this.data.pos;
    const p = this.create_sprite_info();
    this._sprite
      .set_info(p)
      .set_center(...this.center)
      .set_position(x, -y, z)
      .set_opacity(p.texture || p.color ? 1 : 0)
      .set_visible(this.visible)
      .set_name(`layout(name= ${this.name}, id=${this.id})`)
      .apply();
    this.parent?.sprite.add(this._sprite);
  }

  create_sprite_info(): ISpriteInfo {
    const [w, h] = this.size;
    const texture = this.create_texture();
    const p: ISpriteInfo = {
      w,
      h,
      texture,
      color: this.data.bg_color,
    };
    return p;
  }

  update_img() {
    const p = this.create_sprite_info();
    this._sprite.set_info(p).apply();
  }

  on_click(): boolean {
    const { click } = this.data.actions ?? {};
    click && actor.act(this, click);
    for (const c of this._components) c.on_click?.();
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
    let l: Node | undefined = this;
    for (; l?._parent; l = l.parent) global_z += this.sprite.z;
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

  update(dt: number) {
    if (this._root === this) this._sprite.x = this.lf2.world.camera.x;
    const { visible } = this;
    if (visible !== this._sprite.visible) {
      this._sprite.visible = visible;
      this.invoke_visible_callback();
    }
    this._sprite.opacity = this.opacity;
    for (const i of this.children) i.update(dt);
    for (const c of this._components) c.update?.(dt);
  }

  on_player_key_down(player_id: string, key: GameKey) {
    for (const i of this.children) i.on_player_key_down(player_id, key);
    for (const c of this._components) c.on_player_key_down?.(player_id, key);
    if ("a" === key) this._focused_item?.on_click();
  }

  on_player_key_up(player_id: string, key: GameKey) {
    for (const i of this.children) i.on_player_key_up(player_id, key);
    for (const c of this._components) c.on_player_key_up?.(player_id, key);
  }

  find_layout(id: string): Node | undefined {
    return this.id_layout_map.get(id);
  }

  find_layout_by_name(name: string): Node | undefined {
    return this.name_layout_map.get(name);
  }

  get_value(name: string, lookup: boolean = true): any {
    const { values } = this.data;
    if (values && name in values) return values[name];
    if (lookup && this.parent) return this.parent.get_value(name, lookup);
    return void 0;
  }

  /**
   * 查找当前layout符合条件的的component
   * @param type
   * @param condition
   * @returns
   */
  find_component<T extends TCls>(
    type: T,
    condition: TCond<T> = () => 1,
  ): InstanceType<T> | undefined {
    return find(
      this.components,
      (v) => v instanceof type && condition(v as any),
    ) as InstanceType<T> | undefined;
  }

  /**
   * 查找当前layout符合条件的的component数组
   * @param type
   * @param condition
   * @returns
   */
  find_components<T extends TCls>(
    type: T,
    condition: TCond<T> = () => 1,
  ): InstanceType<T>[] {
    return filter(
      this.components,
      (v) => v instanceof type && condition(v as any),
    ) as InstanceType<T>[];
  }

  /**
   * 查找当前layout以及子layout符合条件的component
   * @param type
   * @param condition
   * @returns
   */
  search_component<T extends TCls>(
    type: T,
    condition: TCond<T> = () => 1,
  ): InstanceType<T> | undefined {
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
  search_components<T extends TCls>(
    type: T,
    condition: TCond<T> = () => 1,
  ): InstanceType<T>[] {
    const ret = this.find_components(type, condition);
    for (const i of this._children)
      ret.push(...i.search_components(type, condition));
    return ret;
  }

  lookup_component<T extends TCls>(
    type: T,
    condition: TCond<T> = () => 1,
  ): InstanceType<T> | undefined {
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
export default Node;
type TCls<R = any> = abstract new (...args: any) => R;
type TCond<T extends TCls> = (c: InstanceType<T>) => unknown;
