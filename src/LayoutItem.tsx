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
    ret._cook_img_infos(lf2);
    ret._cook_img_idx(get_val);
    ret._cook_visible(get_val);
    ret._cook_rects();
    return ret;
  }

  private async _cook_img_infos(lf2: LF2) {
    const { img } = this.data;
    const img_paths = !is_arr(img) ? [img] : img;
    const img_infos: TImageInfo[] = [];
    const preload = async (img_path: string) => {
      const img_info = image_pool.find(img_path);
      if (img_info) return img_info;
      const img_url = await lf2.import(img_path);
      return await image_pool.load(img_path, img_url);
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
    const { w: img_w, h: img_h } = this.img_infos?.[0] || {};
    const [sx = 0, sy = 0, sw = 0, sh = 0] = this.data.rect ?? [0, 0, img_w, img_h];
    const [w = 0, h = 0] = this.data.size ?? [sw, sh];
    const [cx, cy] = this.data.center ?? [0, 0];
    const [x, y] = this.data.pos ?? [0, 0];

    // 宽或高其一为0时，使用原图宽高比例的计算之
    const dw = Math.floor(w ? w : sh ? h * sw / sh : 0)
    const dh = Math.floor(h ? h : sw ? w * sh / sw : 0)
    const dx = x - Math.floor(cx * dw)
    const dy = y - Math.floor(cy * dh)

    this.src_rect = [sx, sy, sw, sh];
    this.dst_rect = [dx, dy, dw, dh];
  }
}
