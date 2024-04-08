import * as THREE from 'three';
import LF2 from '../LF2/LF2';
import { Condition, ValGetter } from '../LF2/loader/Condition';
import { create_picture, image_pool, type TImageInfo } from '../LF2/loader/loader';
import { NumberAnimation } from '../NumberAnimation';
import { is_arr } from '../js_utils/is_arr';
import { is_bool } from '../js_utils/is_bool';
import { is_num } from '../js_utils/is_num';
import { is_str } from '../js_utils/is_str';
import type { ILayoutInfo } from './ILayoutInfo';
import { read_as_4_nums } from './utils/read_as_4_nums';
import { read_as_2_nums } from './utils/read_as_2_nums';
import { read_func_args_2 } from './utils/read_func_args';
import { LayoutComponent } from './Component/LayoutComponent';
import { PlayerKeyEditor } from './Component/PlayerKeyEditor';

export interface ILayoutCallback {
  on_click?(): void;
}

export default class Layout {
  protected _callbacks = new Set<ILayoutCallback>();
  add_callback(callback: ILayoutCallback) { this._callbacks.add(callback); return this; }
  del_callback(callback: ILayoutCallback) { this._callbacks.delete(callback); return this; }

  protected _opacity_animation = new NumberAnimation();
  protected _root: Layout;
  protected _left_to_right: Layout[] = [];
  protected _top_to_bottom: Layout[] = [];
  protected _focused_item?: Layout;
  protected _components = new Set<LayoutComponent>();
  set_opacity_animation(
    reverse: boolean,
    begin: number = 0,
    end: number = 1,
    duration: number = 150
  ) {
    const anim = this._opacity_animation;
    if (begin !== anim.val_1 && end !== anim.val_2 && duration !== anim.duration)
      anim.set(begin, end, duration, reverse).set_value(this._material?.opacity || 0)
    if (anim.reverse !== reverse)
      anim.play(reverse).set_value(this._material?.opacity || 0);
  }
  protected _state: any = {}
  protected _visible = () => true;
  protected _img_idx = () => 0;
  protected _opacity = () => 1;
  protected _parent?: Layout;
  protected _items: Layout[] = [];
  protected _index: number = 0;
  protected _level: number = 0;
  protected _material?: THREE.MeshBasicMaterial;

  readonly data: Readonly<ILayoutInfo>;

  center: [number, number];
  pos: [number, number];
  img_infos?: TImageInfo[];

  src_rect: [number, number, number, number] = [0, 0, 0, 0];
  dst_rect: [number, number, number, number] = [0, 0, 0, 0];
  lf2: LF2;
  get focused_item(): Layout | undefined { return this._root === this ? this._focused_item : this._root._focused_item }
  get z_order(): number { return this.data.z_order ?? 0 };
  get root() { return this._root }
  get level() { return this._level }
  get index() { return this._index }
  get state() { return this._state }
  get img_idx() { return this._img_idx() }
  get visible(): boolean { return this._visible() && this.parent?.visible !== false }
  get opacity() { return this._opacity() }
  get parent() { return this._parent; }
  set parent(v) { this._parent = v; }
  get items() { return this._items; }
  set items(v) { this._items = v; }
  get size(): [number, number] { return [this.dst_rect[2], this.dst_rect[3]] }
  set size([w, h]: [number, number]) {
    this.dst_rect[2] = w;
    this.dst_rect[3] = h;
  }
  constructor(lf2: LF2, data: ILayoutInfo, parent?: Layout) {
    this.lf2 = lf2;
    this.data = Object.freeze(data);
    this.center = read_as_2_nums(this.data.center, 0, 0)
    this.pos = read_as_2_nums(this.data.pos, 0, 0)
    this.parent = parent;
    this._root = parent ? parent.root : this;
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
    this.init_3d();

    for (const item of this.items)
      item.on_mount();

    const { enter: a } = this.data.actions || {};
    if (a) this.handle_layout_action(a);

    for (const c of this._components) c.on_mount?.();
  }
  on_unmount() {
    for (const c of this._components) c.on_unmount?.();

    const { leave: a } = this.data.actions || {};
    if (a) this.handle_layout_action(a);

    for (const item of this.items)
      item.on_unmount()

    this._sprite?.removeFromParent();
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
        cooked_item._index = ret.items.length;
        cooked_item._level = ret.level + 1;
        ret.items.push(cooked_item);
      }
    if (!parent) {
      ret.size = [794, 450];
      ret.center = [0, 0];
      ret.pos = [0, -450]
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
    const args = read_func_args_2(component, 'key_set');
    if (args) {
      const [, which, key_name] = args;
      this._components.add(new PlayerKeyEditor(this).init(which, key_name))
      return;
    }
  }

  private async _cook_imgs(lf2: LF2) {
    const { img, flip_x, flip_y } = this.data;
    do {
      if (!img) break;

      const img_paths = !is_arr(img) ? [img] : img.filter(v => is_str(img));
      if (!img_paths.length) break;

      const img_infos: TImageInfo[] = [];
      const [sx, sy, sw, sh] = read_as_4_nums(this.data.rect, 0, 0, 0, 0)
      const preload = async (img_path: string) => {
        const img_key = [img_path, sx, sy, sw, sh, flip_x ? 1 : 0, flip_y ? 1 : 0].join('_')
        const img_info = image_pool.find(img_key);
        if (img_info) return img_info;
        const img_url = await lf2.import(img_path);
        return await image_pool.load(img_key, img_url, (img, cvs, ctx) => {
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

    const { txt_fill, txt_stroke, txt } = this.data;
    do {
      if (!is_str(txt)) break;
      this.img_infos = [await image_pool.load_text(txt, { fillStyle: txt_fill, strokeStyle: txt_stroke })]
    } while (0);
  }

  private _cook_data(get_val: ValGetter<Layout>) {
    const { visible, opacity } = this.data;

    if (is_str(visible)) {
      const func = new Condition<Layout>(visible, get_val).make();
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

    const [sx, sy, sw, sh] = read_as_4_nums(rect, 0, 0, img_w, img_h)
    const [w, h] = read_as_2_nums(size, sw, sh);
    const [cx, cy] = read_as_2_nums(center, 0, 0);
    const [x, y] = read_as_2_nums(pos, 0, 0);

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
    const texture = create_picture(img_info.key, img_info).data.texture;
    texture.offset.set(flip_x ? 1 : 0, flip_y ? 1 : 0);
    return texture;
  }

  protected _sprite?: THREE.Object3D;
  get sprite() { return this._sprite }
  protected init_3d() {
    const [cx, cy] = this.center;
    const [x, y] = this.pos;
    const [w, h] = this.size;
    const texture = this.create_texture();
    const center_x = Math.round((0.5 - cx) * w);
    const center_y = Math.round((cy - 0.5) * h);
    const geo = new THREE.PlaneGeometry(w, h)
      .translate(center_x, center_y, 0);
    const params: THREE.MeshBasicMaterialParameters = {
      transparent: true,
    };
    if (texture) params.map = texture;
    else if (this.data.bg_color) params.color = this.data.bg_color;
    else params.color = 0;

    this._material = new THREE.MeshBasicMaterial(params);
    this._sprite = new THREE.Mesh(geo, this._material);
    this._sprite.name = this.data.name ?? this.data.id ?? '';
    this._sprite.position.set(x, -y, 0);
    this._sprite.userData = {
      owner: this,
    };

    (this.parent?.sprite || this.lf2.world.scene)?.add(this._sprite);

    // const box = new THREE.Box3().expandByObject(this._sprite);
    // const cam = this.lf2.world.camera;
    // const cam_half_h = cam.top / 2;
    // const cam_half_w = cam.right / 2;
    // const a = [
    //   new THREE.Vector3(box.min.x, box.min.y, box.min.z),
    //   new THREE.Vector3(box.min.x, box.min.y, box.max.z),
    //   new THREE.Vector3(box.min.x, box.max.y, box.min.z),
    //   new THREE.Vector3(box.min.x, box.max.y, box.max.z),
    //   new THREE.Vector3(box.max.x, box.min.y, box.min.z),
    //   new THREE.Vector3(box.max.x, box.min.y, box.max.z),
    //   new THREE.Vector3(box.max.x, box.max.y, box.min.z),
    //   new THREE.Vector3(box.max.x, box.max.y, box.max.z)
    // ].map(v => {
    //   const { x, y } = v.project(cam);
    //   v.x = Math.round(x * cam_half_w + cam_half_w);
    //   v.y = Math.round(y * cam_half_h + cam_half_h);
    //   return v;
    // })
  }

  on_click(): boolean {
    const { click } = this.data.actions ?? {};
    if (click) this.handle_layout_action(click)
    for (const c of this._components) {
      if (!c.on_click) continue;
      if (c.on_click()) break;
    }
    return !!click;
  }

  handle_layout_action = (action: string) => {
    if (action === 'loop_img')
      return this.to_next_img();
    if (action === 'cancel_load_data')
      return this.lf2?.clear()
    if (action === 'load_default_data')
      return this.lf2.start();

    const [, url = null] = action.match(/link_to\((.+)\)/) ?? [];
    if (url !== null) return window.open(url)

    const [, alert_msg = null] = action.match(/alert\((.+)\)/) ?? []
    if (alert_msg !== null) return alert(alert_msg);

    const [, next_layout_id = null] = action.match(/goto\((.+)\)/) ?? []
    if (next_layout_id !== null) return this.lf2.set_layout(next_layout_id)
  }

  on_render(dt: number) {
    const sprite = this.sprite;
    if (sprite) {
      if (this._root === this) {
        sprite.position.x = this.lf2.world.camera.position.x
      }
      sprite.visible = this.visible;
    }
    if (this._material) {
      const next_opacity = this.opacity;
      if (next_opacity >= 0) {
        this._material.opacity = next_opacity;
      } else if (this._opacity_animation) {
        this._material.opacity = this._opacity_animation.update(dt);
      }
    }
    for (const item of this.items) {
      item.on_render(dt);
    }
  }

  on_player_key_down(k: "L" | "R" | "U" | "D" | "a" | "j" | "d") {
    const lr_items = this._left_to_right.filter(v => v.visible);
    const lr_lengh = lr_items.length;
    const ud_items = this._top_to_bottom.filter(v => v.visible);
    const ud_lengh = ud_items.length;
    switch (k) {
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
}