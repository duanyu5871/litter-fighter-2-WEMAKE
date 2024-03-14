import * as THREE from 'three';
import { create_img_ele } from '../../Utils/create_img_ele';
import { get_blob } from '../../Utils/get_blob';
import { IEntityPictureInfo } from '../../js_utils/lf2_type';
import { IPictureInfo } from '../../types/IPictureInfo';
import SparkMD5 from "spark-md5";

export type TPictureInfo = IPictureInfo<THREE.Texture>;
export type TDataPromise<T> = Promise<T> & { data: T }

export function make_data_promise_resolve<T>(data: T): TDataPromise<T> {
  return Object.assign(Promise.resolve(data), { data })
}
export function make_data_promise_reject<T>(data: T, reason: any): TDataPromise<T> {
  return Object.assign(Promise.reject(reason), { data })
}
export const texture_loader = new THREE.TextureLoader();
export type TImageInfo = {
  key: string,
  url: string;
  w: number;
  h: number;
  minFilter?: THREE.MinificationTextureFilter;
  magFilter?: THREE.MagnificationTextureFilter;
}

export type PaintFunc = (img: HTMLImageElement, cvs: HTMLCanvasElement, ctx: CanvasRenderingContext2D) => void;
export interface TxtStyle {
  font?: string;
  fillStyle?: string;
  strokeStyle?: string;
  lineWidth?: number;
}
class ImagePool {
  protected _map = new Map<string, TImageInfo>();
  protected _paint(
    img: HTMLImageElement,
    cvs: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D
  ) {
    cvs.width = img.width;
    cvs.height = img.height;
    ctx.drawImage(img, 0, 0);
  }

  protected async _make_info(key: string, src: string, paint?: typeof this._paint): Promise<TImageInfo> {
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d', { willReadFrequently: true });
    if (!ctx) throw new Error("can not get context from canvas");
    const img_ele = await create_img_ele(src);
    if (paint) paint(img_ele, cvs, ctx)
    else this._paint(img_ele, cvs, ctx);
    const blob = await get_blob(cvs).catch(e => { throw new Error(e.message + ' key:' + key, { cause: e.cause }) });
    const url = URL.createObjectURL(blob);
    return { key, url, w: img_ele.width, h: img_ele.height }
  }

  protected async _make_text_info(key: string, text: string, style?: TxtStyle): Promise<TImageInfo> {
    const cvs = document.createElement('canvas');
    const ctx = cvs.getContext('2d');
    if (!ctx) throw new Error("can not get context from canvas");

    const apply_test_style = () => {
      ctx.font = style?.font ?? 'normal 9px system-ui';
      ctx.fillStyle = style?.fillStyle ?? 'white';
      ctx.shadowColor = style?.strokeStyle ?? 'black';
      ctx.lineWidth = style?.lineWidth ?? 1;
      ctx.shadowBlur = 5;
    }
    apply_test_style();
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
    cvs.style.width = (cvs.width = w) + 'px'
    cvs.style.height = (cvs.height = h) + 'px';
    apply_test_style();
    for (const { x, y, t } of lines) {
      ctx.fillText(t, x, y);
    }
    const blob = await get_blob(cvs).catch(e => { throw new Error(e.message + ' key:' + key, { cause: e.cause }) });
    const url = URL.createObjectURL(blob);
    return { key, url, w, h }
  }
  find(key: string) {
    return this._map.get(key)
  }
  async load_text(text: string, style?: TxtStyle): Promise<TImageInfo> {
    const key = new SparkMD5().append(text).append(JSON.stringify(style)).end()

    let info = this._map.get(key);
    if (info) return info;
    info = await this._make_text_info(key, text, style);
    this._map.set(key, info);
    return info
  }

  async load(key: string, src: string, paint?: PaintFunc): Promise<TImageInfo> {
    let info = this._map.get(key);
    if (info) return info;
    info = await this._make_info(key, src, paint);
    this._map.set(key, info);
    return info
  }

  protected _gen_key = (f: IEntityPictureInfo) => `${f.path}_${f.w}_${f.h}_${f.row}_${f.col}`;
  async load_by_pic_info(f: IEntityPictureInfo, get_src: (f: IEntityPictureInfo) => string): Promise<TImageInfo> {
    const key = this._gen_key(f);
    const src = get_src(f);
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

    return this.load(key, src, paint);
  }

  find_by_pic_info(f: IEntityPictureInfo) {
    return this._map.get(this._gen_key(f))
  }
}
export const image_pool = new ImagePool();


const error_texture = () => {
  const texture = texture_loader.load(require('../checker.png'));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

export function create_picture(
  id: string,
  img_info: TImageInfo,
  picture: TPictureInfo = error_picture_info(id),
): TDataPromise<TPictureInfo> {
  let ok: (_: TPictureInfo) => void;
  let bad: (_: any) => void;
  const { url, w: i_w, h: i_h, minFilter, magFilter } = img_info;
  const on_progress = (e: ProgressEvent) => console.log(`[create_picture] loading texture, id: ${id}, progress: ${Math.floor(100 * e.loaded / e.total)}%`);
  const on_load = () => ok(picture);
  const texture = texture_loader.load(url, on_load, on_progress, e => bad(e));
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = minFilter ?? THREE.NearestFilter;
  texture.magFilter = magFilter ?? THREE.NearestFilter;
  texture.wrapS = THREE.MirroredRepeatWrapping;
  picture.i_w = i_w;
  picture.i_h = i_h;
  picture.texture = texture;
  const p = new Promise<TPictureInfo>((a, b) => { ok = a; bad = b; });
  return Object.assign(p, { data: picture });
}

export function error_picture_info(id: string): TPictureInfo {
  return {
    id, i_w: 0, i_h: 0, cell_w: 0, cell_h: 0, row: 1, col: 1,
    texture: error_texture()
  }
}
export function create_picture_by_img_key(id: string, img_key: string) {
  const img_info = image_pool.find(img_key);
  const picture = error_picture_info(id);
  if (!img_info) {
    return make_data_promise_reject(picture, new Error("[create_picture_by_img_key] failed, image info not found in image pool."));
  }
  picture.cell_w = picture.i_w = img_info.w
  picture.cell_h = picture.i_h = img_info.h
  return create_picture(id, img_info, picture);
}

export function create_picture_by_pic_info(id: string, pic_info: IEntityPictureInfo): TDataPromise<TPictureInfo> {
  const img_info = image_pool.find_by_pic_info(pic_info);
  const { w: cell_w, h: cell_h, row, col } = pic_info;
  const picture: TPictureInfo = {
    id,
    i_w: 0, i_h: 0,
    cell_w: cell_w + 1,
    cell_h: cell_h + 1,
    row, col,
    texture: error_texture()
  };
  if (!img_info) {
    return make_data_promise_reject(picture, new Error("[create_picture_by_pic_info] failed, image info not found in image pool."));
  }
  return create_picture(id, img_info, picture);
}


