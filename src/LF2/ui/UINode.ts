import LF2 from "../LF2";
import Callbacks from "../base/Callbacks";
import { Expression } from "../base/Expression";
import { NoEmitCallbacks } from "../base/NoEmitCallbacks";
import StateDelegate from "../base/StateDelegate";
import { IValGetter } from "../defines/IExpression";
import IStyle from "../defines/IStyle";
import Ditto from "../ditto";
import { IUINodeRenderer } from "../ditto/render/IUINodeRenderer";
import { IDebugging, make_debugging } from "../entity/make_debugging";
import { type IImageInfo } from "../loader/IImageInfo";
import { ImageInfo } from "../loader/ImageInfo";
import { filter, find } from "../utils/container_help";
import { is_arr, is_bool, is_num, is_str } from "../utils/type_check";
import { ICookedUIInfo } from "./ICookedUIInfo";
import { IUICallback } from "./IUICallback";
import { IUIImgInfo } from "./IUIImgInfo.dat";
import type { IUIInfo, TUIImgInfo } from "./IUIInfo.dat";
import { IUIKeyEvent } from "./IUIKeyEvent";
import { IUIPointerEvent } from "./IUIPointerEvent";
import actor from "./action/Actor";
import factory from "./component/Factory";
import { UIComponent } from "./component/UIComponent";
import read_nums from "./utils/read_nums";
import { validate_ui_img_info } from "./validate_ui_img_info";
export class UINode implements IDebugging {
  static readonly TAG: string = 'UINode';
  debug!: (_0: string, ..._1: any[]) => void;
  warn!: (_0: string, ..._1: any[]) => void;
  log!: (_0: string, ..._1: any[]) => void;

  readonly lf2: LF2;
  readonly id_ui_map: Map<string, UINode[]>;
  readonly name_ui_map: Map<string, UINode[]>;

  protected _callbacks = new Callbacks<IUICallback>();
  protected _pointer_on_me: 0 | 1 = 0;
  protected _pointer_down: 0 | 1 = 0;
  protected _click_flag: 0 | 1 = 0;

  get callbacks(): NoEmitCallbacks<IUICallback> {
    return this._callbacks;
  }
  /**
   * 根节点
   *
   * @protected
   * @type {UINode}
   */
  protected _root: UINode;
  protected _focused_node?: UINode;
  protected _pos: StateDelegate<[number, number, number]> = new StateDelegate(() => this.data.pos);
  protected _scale: StateDelegate<[number, number, number]> = new StateDelegate(() => this.data.scale);
  protected _components = new Set<UIComponent>();
  protected _state: any = {};
  protected _visible: StateDelegate<boolean> = new StateDelegate(true);
  protected _disabled: StateDelegate<boolean> = new StateDelegate(false);
  protected _opacity: StateDelegate<number> = new StateDelegate(1);
  protected _img_infos: StateDelegate<IImageInfo[]> = new StateDelegate([]);
  protected _size: StateDelegate<[number, number]> = new StateDelegate([0, 0]);
  protected _center: StateDelegate<[number, number, number]> =
    new StateDelegate([0, 0, 0]);

  protected _img_idx = () => 0;
  protected _parent?: UINode;
  protected _children: UINode[] = [];
  protected _index: number = 0;
  readonly data: Readonly<ICookedUIInfo>;
  get scale() { return this._scale.value }
  set scale(v: [number, number, number]) { this.set_scale(...v) }
  set_scale(x?: number, y?: number, z?: number): this {
    const [a, b, c] = this._scale.value;
    this._scale.value = [x ?? a, y ?? b, z ?? c];
    return this;
  }

  get focused(): boolean {
    return this._root._focused_node === this;
  }
  set focused(v: boolean) {
    if (v) this.focused_node = this;
    else if (this.focused_node === this) this.focused_node = void 0;
  }
  get focused_node(): UINode | undefined {
    return this._root._focused_node;
  }
  set focused_node(val: UINode | undefined) {
    const old = this._root._focused_node;
    if (old === val) return;
    if (val?.disabled || !val?.visible) val = void 0;
    this._root._focused_node = val;
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
    this._pos.set(1, v);
  }
  set_pos(x: number, y: number, z: number): this {
    this._pos.set(1, [x, y, z]);
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
    return this.set_pos(x, y, z);
  }

  get y(): number {
    return this.pos[1];
  }
  set y(v: number) {
    this.set_y(v);
  }
  set_y(y: number): this {
    const [x, , z] = this.pos;
    return this.set_pos(x, y, z);
  }

  get z(): number {
    return this.pos[2];
  }
  set z(z: number) {
    this.set_z(z);
  }
  set_z(z: number): this {
    const [x, y] = this.pos;
    return this.set_pos(x, y, z);
  }

  get root(): UINode {
    return this._root;
  }

  get depth() {
    let depth = 0;
    let l: UINode | undefined = this;
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

  /**
   * 当前节点是否可见
   * 
   * @description 
   *    要注意，当任意一个祖先节点visible为false时，
   *    即使设置当前节点为visible为true，visible属性仍将返回false
   *
   * @type {boolean}
   */
  get visible(): boolean {
    if (!this.parent) return this._visible.value
    return this.parent.visible && this._visible.value;
  }

  set visible(v: boolean) {
    this.set_visible(v);
  }

  set_visible(v: boolean): this {
    const prev = this.visible;
    this._visible.set(1, v);
    if (prev !== this.visible) this.invoke_all_visible()
    if (!v && !this.focused_node?.visible) this.focused_node = void 0
    return this;
  }

  get disabled(): boolean {
    if (!this.parent) return this._disabled.value;
    return this.parent.disabled || this._disabled.value;
  }
  set disabled(v: boolean) {
    this.set_disabled(v);
  }
  set_disabled(v: boolean): this {
    this._disabled.set(1, v);
    if (v && this.focused_node?.disabled) this.focused_node = void 0
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

  get parent(): UINode | undefined { return this._parent; }
  get children(): Readonly<UINode[]> { return this._children; }

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
    return this.data.txt?.style || {}
  }

  get imgs() {
    return this._img_infos.value;
  }
  set imgs(v: IImageInfo[]) {
    this.set_imgs(v);
  }
  set_imgs(v: IImageInfo[]): this {
    this._img_infos.set(1, v);
    return this;
  }
  get pointer_on_me() { return this._pointer_on_me }
  get pointer_down() { return this._pointer_down }
  get click_flag() { return this._click_flag }

  renderer: IUINodeRenderer;

  constructor(lf2: LF2, data: ICookedUIInfo, parent?: UINode) {
    this.lf2 = lf2;
    this.data = Object.freeze(data);
    this._parent = parent;
    this._root = parent?.root ?? this;
    this.id_ui_map = parent?.id_ui_map ?? new Map();
    this.name_ui_map = parent?.name_ui_map ?? new Map();

    this.renderer = new Ditto.UINodeRenderer(this);
    make_debugging(this)
  }

  get x_on_root(): number {
    let x = 0;
    let node: UINode | undefined = this;
    do {
      x += node.x;
      node = node.parent;
    } while (node);
    return x;
  }

  get y_on_root(): number {
    let ret = 0;
    let node: UINode | undefined = this;
    do {
      ret += node.y;
      node = node.parent;
    } while (node);
    return ret;
  }

  hit(x: number, y: number): boolean {
    const [cx, cy] = this.center;
    const [px, py] = this.pos;
    const [dw, dh] = this.size;
    const l = px - Math.floor(cx * dw);
    const t = py - Math.floor(cy * dh);
    const [w, h] = this.data.size;
    return l <= x && t <= y && l + w >= x && t + h >= y;
  }
  on_pointer_down(e: IUIPointerEvent) {
    this._pointer_down = 1;
    this._click_flag = 1;
  }

  on_pointer_up(e: IUIPointerEvent) {
    this._pointer_down = 0
  }

  on_pointer_cancel(e: IUIPointerEvent) {
    this._pointer_down = 0
  }

  on_pointer_leave() {
    this._pointer_on_me = 0;
    this._click_flag = 0;
  }

  on_pointer_enter() {
    this._pointer_on_me = 1
  }

  on_start() {
    this._state = {};
    for (const c of this._components) c.on_start?.();
    for (const i of this.children) i.on_start();
    const { start } = this.data.actions || {};
    start && actor.act(this, start);
    this.renderer.on_start?.();
  }

  on_stop(): void {
    for (const c of this.components) c.on_stop?.();
    for (const l of this.children) l.on_stop();
    const { stop } = this.data.actions || {};
    stop && actor.act(this, stop);
    this.renderer.on_stop?.();
  }

  on_resume() {
    if (!this.parent) {
      this.focused_node = this._state.focused_node;
      if (this._visible) this.invoke_all_visible();
    }
    if (this.root === this) this.lf2.world.scene.add(this.sprite);
    for (const c of this._components) c.on_resume?.();
    for (const i of this.children) i.on_resume();
    const { resume } = this.data.actions || {};
    resume && actor.act(this, resume);
    this.renderer.on_resume?.();
  }

  on_pause() {
    if (!this.parent) {
      this._state.focused_node = this.focused_node;
      this.focused_node = void 0;
      this.invoke_all_on_hide();
    }
    if (this.root === this) this.renderer.del_self();
    const { pause } = this.data.actions || {};
    pause && actor.act(this, pause);
    for (const c of this._components) c.on_pause?.();
    for (const item of this.children) item.on_pause();
    this.renderer.on_pause?.();
  }

  on_show() {
    for (const c of this.components) c.on_show?.();
    this._callbacks.emit("on_show")(this);
    if (this.data.auto_focus && !this.disabled && !this.focused_node) {
      this.focused_node = this;
    }
    this.renderer.on_show?.();
  }

  on_hide() {
    if (this.focused_node === this) this.focused_node = void 0;
    for (const c of this.components) c.on_hide?.();
    this._callbacks.emit("on_hide")(this);
    this.renderer.on_hide?.();
  }

  to_next_img() {
    const { img_idx, imgs: img_infos } = this;
    if (!img_infos?.length) return;
    this._img_idx = () => (img_idx + 1) % img_infos.length;
  }

  protected static async read_template(lf2: LF2, raw_info: IUIInfo, parent: ICookedUIInfo | undefined): Promise<IUIInfo> {
    const { template: template_name, ...remain_raw_info } = raw_info
    if (!template_name) return raw_info;
    let raw_template: IUIInfo | undefined = void 0;
    let n = parent;
    while (n && !raw_template) {
      raw_template = n.templates?.[template_name];
      n = n.parent;
    }
    raw_template = raw_template || await lf2.import_json<IUIInfo>(template_name);
    Object.assign(raw_template, remain_raw_info);
    const cooked_template = await this.cook_ui_info(lf2, raw_template, parent);
    return { ...cooked_template, ...remain_raw_info };
  }

  static async cook_ui_info(
    lf2: LF2,
    data_or_path: IUIInfo | string,
    parent?: ICookedUIInfo,
  ): Promise<ICookedUIInfo> {
    let raw_info = is_str(data_or_path)
      ? await lf2.import_json<IUIInfo>(data_or_path)
      : data_or_path;

    if (raw_info.template) raw_info = await this.read_template(lf2, raw_info, parent)
    const id = raw_info.id || 'uinode_with_no_id_' + Date.now()
    const name = raw_info.name || 'uinode_with_no_name_' + Date.now()
    const ret: ICookedUIInfo = {
      ...raw_info,
      id, name,
      pos: read_nums(raw_info.pos, 3, [0, 0, 0]),
      scale: read_nums(raw_info.scale, 3, [1, 1, 1]),
      center: read_nums(raw_info.center, 3, [0, 0, 0]),
      size: [0, 0],
      parent,
      img_infos: [],
      items: void 0,
      templates: void 0,
      txt: is_str(raw_info.txt) ? { value: raw_info.txt } : raw_info.txt
    };
    if (raw_info.templates) {
      for (const key in raw_info.templates) {
        const template = raw_info.templates[key]
        if (!template) continue;
        if (!ret.templates) ret.templates = {}
        ret.templates[key] = await this.cook_ui_info(lf2, template, parent)
      }
    }
    const { img, txt } = raw_info;
    if (img) {
      const imgs = !is_arr(img) ? [img] : img;
      const preload = (img: TUIImgInfo): Promise<ImageInfo>[] => {
        const errors: string[] = []
        validate_ui_img_info(img, errors)
        if (errors.length) throw new Error(errors.join('\n'))
        img = typeof img === 'string' ? { path: img } : img
        const {
          path, x = 0, y = 0, w = 0, h = 0, dw = w, dh = h,
          col: cols = 1, row: rows = 1, count = 0
        } = img
        const ret: Promise<ImageInfo>[] = []
        for (let row = 0; row < rows; ++row) {
          for (let col = 0; col < cols; ++col) {
            const idx = row * cols + col;
            if (count > 0 && idx >= count) {
              row == rows;
              break;
            }
            const cpy: IUIImgInfo = {
              ...img,
              x: x + col * w,
              y: y + row * h,
              dw: dw,
              dh: dh
            }
            const img_key = `${path}?x=${cpy.x}&y=${cpy.y}&w=${cpy.w}&h=${cpy.h}&dw=${cpy.dw}&dh=${cpy.dh}`;
            ret.push(lf2.images.load_img(img_key, cpy.path, [{ type: 'crop', ...cpy }]));
          }
        }
        return ret;
      };
      for (const p of imgs) {
        for (const j of preload(p))
          ret.img_infos.push(await j);
      }
    } else if (is_str(txt)) {
      ret.img_infos.push(await lf2.images.load_text(txt));
    } else if (txt) {
      ret.img_infos.push(await lf2.images.load_text(txt.value, txt.style));
    }

    const { w: img_w = 0, h: img_h = 0, scale = 1 } = ret.img_infos?.[0] || {};
    const sw = img_w / scale;
    const sh = img_h / scale;
    const [w, h] = read_nums(raw_info.size, 2, [parent ? sw : lf2.world.screen_w, parent ? sh : lf2.world.screen_h]);
    // 宽或高其一为0时，使用原图宽高比例的计算之
    const dw = Math.floor(w ? w : sh ? (h * sw) / sh : 0);
    const dh = Math.floor(h ? h : sw ? (w * sh) / sw : 0);
    ret.size = [dw, dh];

    const { items } = raw_info;
    if (items && !Array.isArray(items)) {
      Ditto.Warn(`[${UINode.TAG}::cook_ui_info] items must be array, but got`, items)
    }
    if (Array.isArray(items) && items.length) {
      ret.items = [];
      for (const item of items)
        ret.items.push(await UINode.cook_ui_info(lf2, item, ret));
    } else {
      delete ret.items;
    }
    return ret;
  }
  readonly cook = UINode.create.bind(UINode)

  static create(lf2: LF2, info: ICookedUIInfo, parent?: UINode): UINode {
    const ret = new UINode(lf2, info, parent);
    const get_val = lf2.ui_val_getter;
    ret._cook_data(get_val);
    ret._cook_img_idx(get_val);
    ret._cook_component();

    if (info.items) {
      for (const item_info of info.items) {
        let count = (is_num(item_info.count) && item_info.count > 0) ? item_info.count : 1
        while (count) {
          const child = UINode.create(lf2, item_info, ret);
          if (child.id) {
            const set = ret.id_ui_map.get(child.id) || [];
            set.push(child)
            ret.id_ui_map.set(child.id, set);
          }
          if (child.name) {
            const set = ret.name_ui_map.get(child.name) || [];
            set.push(child)
            ret.name_ui_map.set(child.name, set);
          }
          child._index = ret.children.length;
          ret.add_child(child)
          --count;
        }
      }
    }
    return ret;
  }

  add_child(node: UINode): this {
    this._children.push(node);
    return this;
  }

  add_children(...node: UINode[]): this {
    node.forEach(l => this.add_child(l))
    return this;
  }

  private _cook_component() {
    const { component } = this.data;
    if (!component) return;
    for (const c of factory.create(this, component)) {
      this._components.add(c);
    }
  }

  private _cook_data(get_val: IValGetter<UINode>) {
    const { visible, opacity, disabled } = this.data;

    if (is_bool(disabled)) {
      this._disabled.default_value = disabled;
    } else if (is_str(disabled)) {
      const func = new Expression<UINode>(disabled, get_val).run;
      this._disabled.default_value = () => func(this);
    }

    if (is_bool(visible)) {
      this._visible.default_value = visible;
    } else if (is_str(visible)) {
      const func = new Expression<UINode>(visible, get_val).run;
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
    this._pos.default_value = () => {
      if (this.parent) return this.data.pos;
      const [x, y, z] = this.data.pos;
      return [x, y - this.lf2.world.screen_h, z]
    }
  }

  private _cook_img_idx(get_val: IValGetter<UINode>) {
    const { imgs: img_infos } = this;
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
  /** @deprecated get rip of it */
  get sprite() { return this.renderer.sprite; }

  on_click(e: IUIPointerEvent) {
    const { click } = this.data.actions ?? {};
    if (click) {
      actor.act(this, click);
      e.stop_propagation();
    }
    for (const c of this._components) {
      c.on_click?.(e);
      if (e.stopped === 2) break;
    }
  }

  /** 
   * 当前节点从"不可见"变为"可见"时被调用 
   */
  protected invoke_all_on_show() {
    this.on_show();
    for (const child of this.children) {
      if (child._visible.value) child.invoke_all_on_show();
    }
  }

  /** 
   * 当前节点从"可见"变为"不可见"时被调用 
   */
  protected invoke_all_on_hide() {
    this.on_hide();
    for (const child of this.children) {
      if (child._visible.value) child.invoke_all_on_hide();
    }
  }

  protected invoke_all_visible() {
    if (this._visible.value) {
      this.invoke_all_on_show();
    } else {
      this.invoke_all_on_hide();
    }
  }

  update(dt: number) {
    for (const i of this.children) i.update(dt);
    for (const c of this._components) if (c.enabled) c.update?.(dt);
  }

  on_key_down(e: IUIKeyEvent) {
    if (e.stopped) return;
    for (const c of this._components) {
      c.on_key_down?.(e);
      if (e.stopped === 2) return;
    }
    for (const i of this.children) {
      i.on_key_down(e);
      if (e.stopped === 2) return;
    }
    if (this.focused && "a" === e.key) {
      const { click } = this.data.actions ?? {};
      if (click) {
        actor.act(this, click);
        e.stop_immediate_propagation();
      }
    }
  }

  on_key_up(e: IUIKeyEvent) {
    if (e.stopped) return;
    for (const i of this.children) {
      i.on_key_up(e);
      if (e.stopped === 2) return;
    }
    for (const c of this._components) {
      c.on_key_up?.(e);
      if (e.stopped === 2) return;
    }
  }

  /**
   * 根据子节点ID查找子节点
   *
   * @see {IUIInfo.id}
   * @param {string} id 子节点ID
   * @return {(UINode | undefined)} 
   * @memberof UINode
   */
  find_child(id: string): UINode | undefined {
    return this.id_ui_map.get(id)?.[0];
  }

  /**
   * 根据子节点名查找子节点
   *
   * @see {IUIInfo.name}
   * @param {string} name 子节点名
   * @return {(UINode | undefined)} 
   * @memberof UINode
   */
  find_child_by_name(name: string): UINode | undefined {
    return this.name_ui_map.get(name)?.[0];
  }

  get_value(name: string, lookup: boolean = true): any {
    const { values } = this.data;
    if (values && name in values) return values[name];
    if (lookup && this.parent) return this.parent.get_value(name, lookup);
    return void 0;
  }

  /**
   * 查找当前layout符合条件的的component
   *
   * @template T
   * @param {T} type
   * @param {(TCond<T> | string)} [condition=() => 1]
   * @param {(c: InstanceType<T>) => void} [handler]
   * @return {(InstanceType<T> | undefined)}
   * @memberof UINode
   */
  find_component<T extends TCls<UIComponent>>(
    type: T,
    condition: TCond<T> | string = () => 1,
    handler?: (c: InstanceType<T>) => void
  ): InstanceType<T> | undefined {
    const ret = find(
      this.components,
      (v) => {
        if (!(v instanceof type)) return 0;
        if (is_str(condition)) return condition === v.id;
        return condition(v as any);
      },
    ) as InstanceType<T> | undefined;

    ret && handler?.(ret)
    return ret
  }

  /**
   * 查找当前layout符合条件的的component数组
   *
   * @template T
   * @param {T} type
   * @param {(TCond<T> | string)} [condition=() => 1]
   * @param {(c: InstanceType<T>[]) => void} [handler]
   * @return {InstanceType<T>[]}
   * @memberof UINode
   */
  find_components<T extends TCls<UIComponent>>(
    type: T,
    condition: TCond<T> | string = () => 1,
    handler?: (c: InstanceType<T>[]) => void
  ): InstanceType<T>[] {
    const ret = filter(
      this.components,
      (v) => {
        if (!(v instanceof type)) return 0;
        if (is_str(condition)) return condition === v.id;
        return condition(v as any);
      },
    ) as InstanceType<T>[];
    ret.length && handler?.(ret);
    return ret;
  }

  /**
   * 查找当前layout以及子layout符合条件的component
   *
   * @template T 
   * @param {T} type
   * @param {(TCond<T> | string)} [condition=() => 1]
   * @param {(c: InstanceType<T>) => void} [handler]
   * @return {(InstanceType<T> | undefined)}
   * @memberof UINode
   */
  search_component<T extends TCls<UIComponent>>(
    type: T,
    condition: TCond<T> | string = () => 1,
    handler?: (c: InstanceType<T>) => void
  ): InstanceType<T> | undefined {
    const ret = this.find_component(type, condition, handler);
    if (ret) return ret;
    for (const i of this._children) {
      const ret = i.search_component(type, condition, handler);
      if (ret) return ret;
    }
  }

  /**
   * 查找当前layout以及子layout符合条件的component数组
   *
   * @template T
   * @param {T} type
   * @param {(TCond<T> | string)} [condition=() => 1]
   * @param {(c: InstanceType<T>[]) => void} [handler]
   * @return {InstanceType<T>[]}
   * @memberof UINode
   */
  search_components<T extends TCls<UIComponent>>(
    type: T,
    condition: TCond<T> | string = () => 1,
    handler?: (c: InstanceType<T>[]) => void
  ): InstanceType<T>[] {
    const ret = this.find_components(type, condition);
    for (const i of this._children)
      ret.push(...i.search_components(type, condition));
    ret.length && handler?.(ret);
    return ret;
  }

  /**
   * 向上查找组件，当前节点不存在对应组件
   *
   * @template T
   * @param {T} type
   * @param {TCond<T>} [condition=() => 1]
   * @param {(c: InstanceType<T>) => void} [handler]
   * @return {(InstanceType<T> | undefined)}
   * @memberof UINode
   */
  lookup_component<T extends TCls<UIComponent>>(
    type: T,
    condition: TCond<T> = () => 1,
    handler?: (c: InstanceType<T>) => void
  ): InstanceType<T> | undefined {
    const ret = this.find_component(type, condition, handler);
    if (ret) return ret;
    return this.parent?.lookup_component(type, condition, handler);
  }

  on_foucs(): void {
    for (const c of this._components) c.on_foucs?.();
    this.renderer.on_foucs?.()
  }
  on_blur(): void {
    for (const c of this._components) c.on_blur?.();
    this.renderer.on_blur?.()
  }
}
type TCls<R = any> = abstract new (...args: any) => R;
type TCond<T extends TCls> = (c: InstanceType<T>) => unknown;
