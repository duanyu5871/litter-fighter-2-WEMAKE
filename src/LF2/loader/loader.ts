import * as THREE from 'three';
import { create_img_ele } from '../../Utils/create_img_ele';
import { get_blob } from '../../Utils/get_blob';
import type LF2 from "../LF2";
import AsyncValuesKeeper from "../base/AsyncValuesKeeper";
import { IEntityPictureInfo } from '../defines';
import type IPicture from '../defines/IPicture';
import type IStyle from "../defines/IStyle";
import Ditto from '../ditto';

export type TPicture = IPicture<THREE.Texture>;

export const texture_loader = new THREE.TextureLoader();
export type TImageInfo = {
  key: string,
  url: string;
  src_url: string;
  scale: number;
  /** 图片宽度（像素） */
  w: number;
  /** 图片高度（像素） */
  h: number;
  min_filter?: THREE.MinificationTextureFilter;
  mag_filter?: THREE.MagnificationTextureFilter;
  img: CanvasImageSource;
  wrap_s?: THREE.Wrapping;
  wrap_t?: THREE.Wrapping;
}
export type ITextImageInfo = TImageInfo & {
  text: string;
}
export interface IPaintParams {
  src_x?: number;
  src_y?: number;
  src_w?: number;
  src_h?: number;
  dst_x?: number;
  dst_y?: number;
  dst_w?: number;
  dst_h?: number;
}
export type PaintFunc = (img: HTMLImageElement, cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
export class ImageMgr {
  readonly lf2: LF2;
  protected _requesters = new AsyncValuesKeeper<TImageInfo>();
  constructor(lf2: LF2) {
    this.lf2 = lf2
  }

  protected async _make_img_info(key: string, src: string, paint?: PaintFunc): Promise<TImageInfo> {
    const [blob_url, src_url] = await this.lf2.import_resource(src);
    const img = await create_img_ele(blob_url);

    let [, txt_scale] =
      src_url.match(/@(\d)[x|X](.png|.webp)$/) ??
      src_url.match(/@(\d)[x|X]\/(.*)(.png|.webp)$/) ?? ['', '1'];


    const scale = Math.max(1, Number(txt_scale));
    if (!paint) {
      return { key, url: blob_url, src_url, scale, w: img.width, h: img.height, img: img }
    }
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("can not get context from canvas");
    paint(img, cvs, ctx);
    const blob = await get_blob(cvs).catch(e => { throw new Error(e.message + ' key:' + key, { cause: e.cause }) });
    const url = URL.createObjectURL(blob);
    return { key, url, src_url, scale, w: cvs.width, h: cvs.height, img: cvs }
  }

  protected async _make_img_info_by_text(key: string, text: string, style: IStyle = {}): Promise<ITextImageInfo> {
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    if (!ctx) throw new Error("can not get context from canvas");

    const {
      padding_b = 2,
      padding_l = 2,
      padding_r = 2,
      padding_t = 2
    } = style
    const text_align = style.text_align ?? 'left'
    const apply_text_style = () => {
      ctx.font = style.font ?? 'normal 9px system-ui';
      ctx.fillStyle = style.fill_style ?? 'white';
      ctx.strokeStyle = style.stroke_style ?? ''
      ctx.shadowColor = style.shadow_color ?? '';
      ctx.lineWidth = style.line_width ?? 1;
      ctx.textAlign = text_align
      ctx.shadowBlur = 5;
      ctx.imageSmoothingEnabled = style.smoothing ?? false
    }
    apply_text_style();
    let w = 0;
    let h = 0;
    const scale = 4;
    let lines = text.split('\n').map((line, idx, arr) => {
      const t = idx === arr.length ? (line + '\n') : line;
      const { width, fontBoundingBoxAscent: a, fontBoundingBoxDescent: d } = ctx.measureText(t);
      const ret = { x: 0, y: h + a, t, w: width }
      w = Math.max(w, width);
      h += a + d;
      return ret;
    })
    if (text_align === 'center')
      for (const l of lines)
        l.x = Math.round(w / 2)
    else if (text_align === 'right')
      for (const l of lines)
        l.x = Math.round(w);
    cvs.style.width = (cvs.width = scale * (w + padding_l + padding_r)) + 'px'
    cvs.style.height = (cvs.height = scale * (h + padding_t + padding_b)) + 'px';

    apply_text_style();
    ctx.save()
    ctx.scale(scale, scale)
    for (const { x, y, t } of lines) {
      ctx.fillText(t, padding_l + x, padding_t + y);
    }
    ctx.restore()
    const blob = await get_blob(cvs).catch(e => { throw new Error(e.message + ' key:' + key, { cause: e.cause }) });
    const url = URL.createObjectURL(blob);
    return {
      key, url, scale: scale, src_url: url,
      w: cvs.width,
      h: cvs.height,
      img: cvs,
      text: text
    }
  }

  find(key: string): TImageInfo | undefined {
    return this._requesters.values.get(key)
  }

  find_by_pic_info(f: IEntityPictureInfo): TImageInfo | undefined {
    return this._requesters.values.get(this._gen_key(f))
  }

  load_text(text: string, style: IStyle = {}): Promise<TImageInfo> {
    const key = Ditto.MD5(text, JSON.stringify(style));
    const fn = () => this._make_img_info_by_text(key, text, style);
    return this._requesters.get(key, fn);
  }

  load_img(key: string, src: string, paint?: PaintFunc): Promise<TImageInfo> {
    const fn = async () => {
      this.lf2.on_loading_content(`${key}`, 0);
      const info = await this._make_img_info(key, src, paint);
      return info
    }
    return this._requesters.get(key, fn);
  }


  remove_img(key: string) {
    const img = this._requesters.take(key);
    if (!img) return;
    if (img.url.startsWith('blob:')) URL.revokeObjectURL(img.url);
    return;
  }

  protected _gen_key = (f: IEntityPictureInfo) => `${f.path}#${f.cell_w || 0}_${f.cell_h || 0}_${f.row}_${f.col}`;
  async load_by_e_pic_info(f: IEntityPictureInfo): Promise<TImageInfo> {
    const key = this._gen_key(f);
    const { path, cell_w, cell_h } = f;
    if (!path.endsWith('bmp') || !cell_w || !cell_h)
      return this.load_img(key, f.path)

    return this.load_img(key, f.path, (img, cvs, ctx) => {
      const { width: w, height: h } = img;
      cvs.width = w;
      cvs.height = h;
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(img, 0, 0);
      const img_data = ctx.getImageData(0, 0, w, h);
      for (let i = 0; i < img_data.data.length; i += 4) {
        const pidx = i / 4;
        if (pidx % (cell_w + 1) === cell_w) {
          img_data.data[i + 3] = 0;
          continue;
        } else if (Math.floor((pidx / w)) % (cell_h + 1) === cell_h) {
          img_data.data[i + 3] = 0;
          continue;
        }
        if (
          img_data.data[i + 0] === 0 &&
          img_data.data[i + 1] === 0 &&
          img_data.data[i + 2] === 0) {
          img_data.data[i + 3] = 0;
        }
      }
      ctx.putImageData(img_data, 0, 0);
    });
  }

  async create_pic(key: string, src: string, params?: IPaintParams): Promise<TPicture> {
    const paint: PaintFunc | undefined = params && ((img, cvs, ctx) => {
      const {
        src_x = 0, src_y = 0, src_w = img.width, src_h = img.height,
        dst_x = 0, dst_y = 0, dst_w = src_w, dst_h = src_h
      } = params;
      cvs.width = dst_w;
      cvs.height = dst_h;
      ctx.drawImage(img,
        src_x, src_y, src_w, src_h,
        dst_x, dst_y, dst_w, dst_h,
      )
    })
    const img_info = await this.load_img(key, src, paint);
    return this.create_pic_by_img_key(img_info.key);
  }

  create_pic_by_img_info(img_info: TImageInfo) {
    const picture = err_pic_info(img_info.key);
    const ret = _create_pic(img_info, picture);
    picture.cell_w = ret.w;
    picture.cell_h = ret.h;
    return ret;
  }

  create_pic_by_img_key(img_key: string) {
    const img_info = this.find(img_key);
    if (!img_info) return err_pic_info();
    return this.create_pic_by_img_info(img_info)
  }

  create_pic_by_e_pic_info(e_pic_info: IEntityPictureInfo) {
    const img_info = this.find_by_pic_info(e_pic_info);
    const { cell_w, cell_h, row, col } = e_pic_info;
    const picture = err_pic_info();
    picture.cell_w = cell_w;
    picture.cell_h = cell_h;
    picture.row = row;
    picture.col = col;
    if (!img_info) return picture;
    return _create_pic(img_info, picture);
  }

  async create_pic_by_text(text: string, style: IStyle = {}) {
    const img_info = await this.load_text(text, style);
    return this.create_pic_by_img_key(img_info.key);
  }

  dispose() {
    // TODO
  }
}



function _create_pic(
  img_info: TImageInfo,
  pic_info: TPicture = err_pic_info(img_info.key),
): TPicture {
  const { url, w, h, min_filter, mag_filter, wrap_s, wrap_t, scale } = img_info;
  const texture = texture_loader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = min_filter ?? THREE.NearestFilter;
  texture.magFilter = mag_filter ?? THREE.NearestFilter;
  texture.wrapS = wrap_s ?? THREE.MirroredRepeatWrapping;
  texture.wrapT = wrap_t ?? THREE.MirroredRepeatWrapping;
  texture.userData = img_info;
  pic_info.w = w / scale;
  pic_info.h = h / scale;
  pic_info.texture = texture;
  return pic_info;
}

export function err_pic_info(id: string = ''): TPicture {
  return {
    id, w: 0, h: 0, cell_w: 0, cell_h: 0, row: 1, col: 1,
    texture: error_texture()
  }
}
export function empty_texture() {
  return texture_loader.load('')
}
export function white_texture() {
  return texture_loader.load(require('./white.png'));
}
export function error_texture() {
  return texture_loader.load(require('./error.png'));
}