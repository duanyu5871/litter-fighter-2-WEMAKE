import SparkMD5 from "spark-md5";
import * as THREE from 'three';
import { create_img_ele } from '../../Utils/create_img_ele';
import { get_blob } from '../../Utils/get_blob';
import { IEntityPictureInfo } from '../../common/lf2_type';
import type IPicture from '../../common/lf2_type/IPicture';
import type LF2 from "../LF2";
import type IStyle from "../../common/lf2_type/IStyle";
import AsyncValuesKeeper from "../base/AsyncValuesKeeper";
export type TPicture = IPicture<THREE.Texture>;

export function make_data_reject<T>(data: T, reason: any): [T, Promise<T>] {
  return [data, Promise.reject(reason)]
}
export const texture_loader = new THREE.TextureLoader();
export type TImageInfo = {
  key: string,
  url: string;
  w: number;
  h: number;
  min_filter?: THREE.MinificationTextureFilter;
  mag_filter?: THREE.MagnificationTextureFilter;
  img: CanvasImageSource;
  wrap_s?: THREE.Wrapping;
  wrap_t?: THREE.Wrapping;
}

export type PaintFunc = (img: HTMLImageElement, cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
export class ImageMgr {
  readonly lf2: LF2;
  constructor(lf2: LF2) {
    this.lf2 = lf2
  }
  protected _requesters = new AsyncValuesKeeper<TImageInfo>();
  protected _paint = (
    img: HTMLImageElement,
    cvs: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) => {
    cvs.width = img.width;
    cvs.height = img.height;
    ctx.drawImage(img, 0, 0);
  }

  protected async _make_img_info(key: string, get_src: () => Promise<string>, paint = this._paint): Promise<TImageInfo> {
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("can not get context from canvas");
    const src = await get_src().then(v => this.lf2.import(v));

    const img_ele = await create_img_ele(src);
    paint(img_ele, cvs, ctx);
    const blob = await get_blob(cvs).catch(e => { throw new Error(e.message + ' key:' + key, { cause: e.cause }) });
    const url = URL.createObjectURL(blob);
    return { key, url, w: cvs.width, h: cvs.height, img: cvs }
  }

  protected async _make_img_info_by_text(key: string, text: string, style: IStyle = {}): Promise<TImageInfo> {
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    if (!ctx) throw new Error("can not get context from canvas");

    const {
      padding_b = 2,
      padding_l = 2,
      padding_r = 2,
      padding_t = 2
    } = style
    const apply_text_style = () => {
      ctx.font = style.font ?? 'normal 9px system-ui';
      ctx.fillStyle = style.fill_style ?? 'white';
      ctx.strokeStyle = style.stroke_style ?? ''
      ctx.shadowColor = style.shadow_color ?? '';
      ctx.lineWidth = style.line_width ?? 1;
      ctx.shadowBlur = 5;
      ctx.imageSmoothingEnabled = style.smoothing ?? false
    }
    apply_text_style();
    let w = 0;
    let h = 0;
    let lines = text.split('\n').map((line, idx, arr) => {
      const t = idx === arr.length ? (line + '\n') : line;
      const { width, fontBoundingBoxAscent: a, fontBoundingBoxDescent: d } = ctx.measureText(t);
      const ret = { x: 0, y: h + a, t }
      w = Math.max(w, width);
      h += a + d;
      return ret;
    })
    cvs.style.width = (cvs.width = w + padding_l + padding_r) + 'px'
    cvs.style.height = (cvs.height = h + padding_t + padding_b) + 'px';
    apply_text_style();
    for (const { x, y, t } of lines) {
      ctx.fillText(t, padding_l + x, padding_t + y);
    }
    const blob = await get_blob(cvs).catch(e => { throw new Error(e.message + ' key:' + key, { cause: e.cause }) });
    const url = URL.createObjectURL(blob);
    return {
      key, url,
      w: w + padding_l + padding_r,
      h: h + padding_t + padding_b,
      img: cvs
    }
  }

  find(key: string) {
    return this._requesters.values.get(key)
  }

  find_by_pic_info(f: IEntityPictureInfo) {
    return this._requesters.values.get(this._gen_key(f))
  }

  load_text(text: string, style: IStyle = {}): Promise<TImageInfo> {
    const key = new SparkMD5().append(text).append(JSON.stringify(style)).end()
    return this._requesters.get(key, async () => {
      return await this._make_img_info_by_text(key, text, style);
    })
  }

  load_img(src: string, get_src?: undefined, paint?: PaintFunc): Promise<TImageInfo>;
  load_img(key: string, get_src: () => Promise<string>, paint?: PaintFunc): Promise<TImageInfo>
  load_img(key: string, get_src?: () => Promise<string>, paint?: PaintFunc): Promise<TImageInfo> {
    return this._requesters.get(key, async () => {
      if (!get_src) get_src = async () => key;
      this.lf2.on_loading_content(`loading img: ${key}`, 0);
      const info = await this._make_img_info(key, get_src, paint);
      this.lf2.on_loading_content(`loading img: ${key}`, 100);
      return info
    })
  }

  protected _gen_key = (f: IEntityPictureInfo) => `${f.path}_${f.w}_${f.h}_${f.row}_${f.col}`;

  async load_by_e_pic_info(f: IEntityPictureInfo, get_src: (f: IEntityPictureInfo) => Promise<string>): Promise<TImageInfo> {
    const key = this._gen_key(f);
    const { path, w: cell_w, h: cell_h } = f;

    const paint: typeof this._paint = (img, cvs, ctx) => {
      const { width: w, height: h } = img;
      cvs.width = w;
      cvs.height = h;
      if (path.endsWith('bmp') && cell_w && cell_h) {
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
      } else {
        this._paint(img, cvs, ctx)
      }
    }

    return this.load_img(key, () => get_src(f), paint);
  }
  async create_pic_by_src(src: string): Promise<TPicture>;
  async create_pic_by_src(key: string, src: string): Promise<TPicture>
  async create_pic_by_src(key: string, src: string = key): Promise<TPicture> {
    const img_info = await this.load_img(key, async () => src)
    return this.create_pic_by_img_key(img_info.key)
  }

  create_pic_by_img_info(img_info: TImageInfo) {
    const picture = err_pic_info();
    picture.cell_w = picture.w = img_info.w
    picture.cell_h = picture.h = img_info.h
    return create_pic(img_info, picture);
  }

  create_pic_by_img_key(img_key: string) {
    const img_info = this.find(img_key);
    if (!img_info) return err_pic_info();
    return this.create_pic_by_img_info(img_info)
  }

  create_pic_by_e_pic_info(e_pic_info: IEntityPictureInfo) {
    const img_info = this.find_by_pic_info(e_pic_info);
    const { w: cell_w, h: cell_h, row, col } = e_pic_info;
    const picture = err_pic_info();
    picture.cell_w = cell_w + 1;
    picture.cell_h = cell_h + 1;
    picture.row = row;
    picture.col = col;
    if (!img_info) return picture;
    return create_pic(img_info, picture);
  }

  async create_pic_by_text(text: string, style: IStyle = {}) {
    const img_info = await this.load_text(text, style);
    return this.create_pic_by_img_key(img_info.key);
  }

  crop(pic: TPicture, x: number, y: number, w: number, h: number): TPicture {
    const texture = pic.texture.clone();
    texture.repeat.set(
      w / pic.w,
      h / pic.h
    )
    texture.offset.set(
      x / pic.w,
      1 - (y + h) / pic.h
    );
    const ret = { ...pic, texture }
    return ret;
  }
}

const error_texture = () => {
  const texture = texture_loader.load(require('./error.png'));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

function create_pic(
  img_info: TImageInfo,
  pic_info: TPicture = err_pic_info(''),
): TPicture {
  const { url, w, h, min_filter, mag_filter, wrap_s, wrap_t } = img_info;
  const texture = texture_loader.load(url);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = min_filter ?? THREE.NearestFilter;
  texture.magFilter = mag_filter ?? THREE.NearestFilter;
  texture.wrapS = wrap_s ?? THREE.MirroredRepeatWrapping;
  texture.wrapT = wrap_t ?? THREE.MirroredRepeatWrapping;
  texture.userData = img_info;
  pic_info.w = w;
  pic_info.h = h;
  pic_info.texture = texture;
  return pic_info;
}

export function err_pic_info(id: string = ''): TPicture {
  return {
    id, w: 0, h: 0, cell_w: 0, cell_h: 0, row: 1, col: 1,
    texture: error_texture()
  }
}


