import * as THREE from 'three';
import type { ILayoutInfo } from './ILayoutInfo';
import LF2 from './LF2/LF2';
import { Condition, ValGetter } from './LF2/loader/Condition';
import { create_picture, image_pool, type TImageInfo } from './LF2/loader/loader';
import { is_arr } from './is_arr';
import { is_bool } from './js_utils/is_bool';
import { is_num } from './js_utils/is_num';
import { is_str } from './js_utils/is_str';


const read_as_2_nums = (v: string | number | number[] | null | undefined, a1: number, a2: number): [number, number] => {
  if (!v) return [a1, a2];
  if (is_num(v)) return [v, v];
  if (is_str(v)) v = v.replace(/\s/g, '').split(',').map(v => Number(v))
  else v = v.map(v => Number(v))
  const [b1, b2] = v;
  return [
    Number.isNaN(b1) ? a1 : b1,
    Number.isNaN(b2) ? a2 : b2
  ]
}
const read_as_4_nums = (v: string | number[] | null | undefined, a1: number, a2: number, a3: number, a4: number): [number, number, number, number] => {
  if (!v) return [a1, a2, a3, a4];
  if (is_num(v)) return [v, v, v, v];
  if (is_str(v)) v = v.replace(/\s/g, '').split(',').map(v => Number(v))
  else v = v.map(v => Number(v))

  const [b1, b2, b3, b4] = v;
  return [
    Number.isNaN(b1) ? a1 : b1,
    Number.isNaN(b2) ? a2 : b2,
    Number.isNaN(b3) ? a3 : b3,
    Number.isNaN(b4) ? a4 : b4
  ]
}
export class Layout {
  protected _state: any = {}
  protected _visible = () => true;
  protected _img_idx = () => 0;
  protected _parent?: Layout;
  protected _items: Layout[] = [];

  readonly data: ILayoutInfo;

  center: [number, number];
  pos: [number, number];
  img_infos?: TImageInfo[];

  src_rect: [number, number, number, number] = [0, 0, 0, 0];
  dst_rect: [number, number, number, number] = [0, 0, 0, 0];
  lf2: LF2;

  get state() { return this._state };
  get img_idx() { return this._img_idx() };
  get visible() { return this._visible() };
  get parent() { return this._parent; }
  set parent(v) { this._parent = v; }
  get items() { return this._items; }
  set items(v) { this._items = v; }
  get size(): [number, number] { return [this.dst_rect[2], this.dst_rect[3]] }
  set size([w, h]: [number, number]) {
    this.dst_rect[2] = w;
    this.dst_rect[3] = h;
  }

  constructor(lf2: LF2, data: ILayoutInfo) {
    this.lf2 = lf2;
    this.data = data;
    this.data.click_action = data.click_action?.trim().replace(/\s/g, '')
    this.center = read_as_2_nums(this.data.center, 0, 0)
    this.pos = read_as_2_nums(this.data.pos, 0, 0)
  }

  hit(x: number, y: number): boolean {
    const [l, t, w, h] = this.dst_rect;
    return l <= x && t <= y && l + w >= x && t + h >= y;
  }

  on_mount() {
    this._state = {};
    for (const item of this.items)
      item.on_mount()
    const { enter_action: a } = this.data;
    if (a) this.handle_layout_action(a);
  }
  on_mouse_leave() {
  }
  on_mouse_enter() {
  }
  on_unmount() {
    for (const item of this.items)
      item.on_unmount()

    const { leave_action: a } = this.data;
    if (a) this.handle_layout_action(a);
  }

  to_next_img() {
    const { img_idx, img_infos } = this;
    if (!img_infos?.length) return;
    this._img_idx = () => (img_idx + 1) % img_infos.length
  }

  static async cook(lf2: LF2, data: ILayoutInfo, get_val: ValGetter<Layout>, parent?: Layout) {
    if (!parent) {
      data.size = [794, 450];
      data.center = [0, 0];
      data.pos = [0, -450]
    }
    const ret = new Layout(lf2, data);
    ret.parent = parent;
    await ret._cook_imgs(lf2);
    ret._cook_img_idx(get_val);
    ret._cook_visible(get_val);
    ret._cook_rects();
    await ret._cook_component();

    if (data.items)
      for (const raw_item of data.items) {
        const cooked_item = await Layout.cook(lf2, raw_item, get_val, ret);
        ret.items.push(cooked_item);
      }
    return ret;
  }

  private async _cook_component() {
    const { component } = this.data
    if (!component) return;
  }

  private async _cook_imgs(lf2: LF2) {
    const { img, flip_x, flip_y } = this.data;
    const img_paths = !is_arr(img) ? [img] : img;
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
  }

  private _cook_visible(get_val: ValGetter<Layout>) {
    const { visible } = this.data;

    if (is_str(visible)) {
      const func = new Condition<Layout>(visible, get_val).make();
      return this._visible = () => {
        const ret = func(this);
        console.log(this.data.visible)
        return ret;
      }
    }
    if (is_bool(visible))
      return this._visible = () => visible
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
  init_3d() {
    if (this._sprite) return;
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
    const material = new THREE.MeshBasicMaterial(params);
    this._sprite = new THREE.Mesh(geo, material);
    this._sprite.position.set(x, -y, 0);
    this._sprite.userData = {
      owner: this,
    }
    this._sprite.onBeforeRender = this.on_before_render
    this.parent?.sprite?.add(this._sprite);
    for (const item of this.items) item.init_3d();
  }

  on_click() {
    const { click_action } = this.data;
    if (!click_action) return;
    this.handle_layout_action(click_action);
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

  on_before_render = (renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera, geometry: THREE.BufferGeometry<THREE.NormalBufferAttributes>, material: THREE.Material, group: THREE.Group<THREE.Object3DEventMap>) => {
    const sprite = this._sprite
    if (!sprite) return;
    sprite.visible = this.visible;
  };
}