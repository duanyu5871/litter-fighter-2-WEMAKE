import * as THREE from 'three';
import type { ILayoutItem } from './ILayoutItem';
import LF2 from './LF2/LF2';
import { Condition, ValGetter } from './LF2/loader/Condition';
import { image_pool, type TImageInfo } from './LF2/loader/loader';
import type { Layout } from './Layout';
import { is_arr } from './is_arr';
import { is_bool } from './js_utils/is_bool';
import { is_num } from './js_utils/is_num';
import { is_str } from './js_utils/is_str';

export class LayoutItem {
  private _state: any = {}
  private _visible = () => true;
  private _img_idx = () => 0;
  readonly data: ILayoutItem;
  readonly layout: Layout;

  get state() { return this._state };
  img_infos?: TImageInfo[];

  src_rect: [number, number, number, number] = [0, 0, 0, 0];
  dst_rect: [number, number, number, number] = [0, 0, 0, 0];

  get img_idx() { return this._img_idx() };

  get visible() { return this._visible() }

  constructor(data: ILayoutItem, layout: Layout) {
    this.data = data;
    this.layout = layout;
    this.data.click_action = data.click_action?.trim().replace(/\s/g, '')
  }

  hit(x: number, y: number): boolean {
    const [l, t, w, h] = this.dst_rect;
    return l <= x && t <= y && l + w >= x && t + h >= y;
  }

  mount() {
    this._state = {};
  }
  unmount() { }

  to_next_img() {
    const { img_idx, img_infos } = this;
    if (!img_infos?.length) return;
    this._img_idx = () => (img_idx + 1) % img_infos.length
  }

  static async cook(lf2: LF2, layout: Layout, data: ILayoutItem, get_val: ValGetter<LayoutItem>) {
    const ret = new LayoutItem(data, layout);
    await ret._cook_imgs(lf2);
    ret._cook_img_idx(get_val);
    ret._cook_visible(get_val);
    ret._cook_rects();
    await ret._cook_component();
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

  private _cook_visible(get_val: ValGetter<LayoutItem>) {
    const { visible } = this.data;

    if (is_str(visible)) {
      const func = new Condition<LayoutItem>(visible, get_val).make();
      return this._visible = () => func(this)
    }
    if (is_bool(visible))
      return this._visible = () => visible
  }

  private _cook_img_idx(get_val: ValGetter<LayoutItem>) {
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


  private _object_3d?: THREE.Object3D;
  get object_3d() { return this._object_3d }
  init_3d() {

    const o3d = this._object_3d = new THREE.Object3D();
    this.layout.object_3d?.add(o3d)
  }
}

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